// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development", // Режим разработки
  entry: "./main.js", // Точка входа вашего приложения (укажите свой основной файл, если он называется иначе)
  output: {
    filename: "bundle.js", // Имя выходного файла сборки
    path: path.resolve(__dirname, "dist"), // Путь к выходной директории
    publicPath: "/dist/", // Публичный путь для dev-сервера
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "."), // Корневая директория для статики (можете настроить по необходимости)
    },
    compress: true,
    port: 8080, // Порт для dev-сервера (можете изменить)
    hot: true, // Включить Hot Module Replacement
    watchFiles: {
      paths: ["./*"], // По умолчанию отслеживает все файлы в корневом каталоге
      options: {
        ignored: /data\.json$/, // Игнорируем файл data.json
      },
    },
  },
};
