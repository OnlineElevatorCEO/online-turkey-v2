DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  image TEXT,
  description TEXT
);

INSERT INTO products (name, price, category, image, description) VALUES
("Konya Tahinli Pide", 80, "Yöresel Lezzetler", "", "Konya taş fırınında pişmiş taze tahinli pide."),
("El Yapımı Bakır Cezve", 350, "El Sanatları", "", "Elde dövme bakır, kalaylı, ince işçilik cezve."),
("Hakiki Deri Cüzdan", 420, "Aksesuar", "", "Tamamen hakiki deriden, el kesimi ve el dikişi cüzdan."),
("El Dokuma Kilim", 2200, "Ev Dekoru", "", "Anadolu motifleriyle el dokuması, yün kilim."),
("Doğal Zeytinyağı 5L", 780, "Gıda", "", "Soğuk sıkım, katkısız naturel sızma zeytinyağı.");
