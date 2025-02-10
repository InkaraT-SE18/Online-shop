const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

// Конфигурация Nodemailer для отправки email
const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true, // Используется SSL
  auth: {
    user: process.env.EMAIL_USER, // Твоя почта mail.ru
    pass: process.env.EMAIL_PASS, // Пароль приложения Mail.ru
  },
});


// Регистрация пользователя
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    res.status(201).json({ message: "Регистрация успешна", user });
  } catch (error) {
    console.error(" Ошибка при регистрации:", error); 
    next(error);
  }
};

// Вход пользователя с отправкой OTP
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Неверный пароль" });
    }

    // Генерируем уникальный секрет для пользователя, если его нет
    if (!user.otpSecret) {
      user.otpSecret = speakeasy.generateSecret().base32;
      await user.save();
    }

    // Генерация OTP-кода
    const otp = speakeasy.totp({
      secret: user.otpSecret,
      encoding: "base32",
      digits: 6,
      step: 300, // 5 минут
    });

    // Сохраняем OTP-код в базе
    user.otp = otp;
    user.otpCreatedAt = Date.now();
    await user.save();

    console.log(`Отправляем OTP ${otp} на ${user.email}`);

    // Отправляем код на email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Код подтверждения входа",
      text: `Ваш код: ${otp}. Действителен 5 минут.`,
    });

    res.status(200).json({ message: "OTP-код отправлен на email", email });
  } catch (error) {
    console.error("Ошибка при логине:", error); 
    next(error);
  }
};



// Проверка OTP-кода и выдача токена
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "OTP-код истёк или недействителен" });
    }

    //  Проверяем, истёк ли OTP-код
    const now = Date.now();
    if (!user.otp || !user.otpCreatedAt || now - user.otpCreatedAt > 5 * 60 * 1000) {
      return res.status(401).json({ message: "OTP-код истёк, запросите новый" });
    }

    //  Проверяем введённый код с сохранённым в базе
    if (user.otp !== otp) {
      return res.status(401).json({ message: "Неверный код" });
    }

    //  Генерация JWT-токена
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Записываем новый токен в `currentToken`, чтобы старый стал недействительным
    user.currentToken = token;
    user.otp = null; // Очистка OTP после успешного входа
    user.otpCreatedAt = null;
    await user.save();

    res.status(200).json({ message: "Вход выполнен", token });
  } catch (error) {
    console.error("Ошибка подтверждения OTP:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Исключаем пароль
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка получения профиля:", error.message);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Получаем ID пользователя из токена
    const { name, email, phone } = req.body;

    // Обновление профиля
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({
      message: "Профиль успешно обновлен",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Исключаем пароль
    res.status(200).json(users);
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении пользователей" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({ message: "Пользователь успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении пользователя" });
  }
};

exports.updateUserAttribute = async (req, res) => {
  try {
    const userId = req.params.id;
    const { field, value } = req.body;

    // Разрешенные поля для обновления
    const allowedFields = ["name", "email", "phone", "role"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: "Недопустимое поле для обновления" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { [field]: value },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({ message: `Поле ${field} успешно обновлено`, user: updatedUser });
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера при обновлении пользователя" });
  }
};
exports.getOtpForTest = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  return res.json({ otp: user.otp });
};