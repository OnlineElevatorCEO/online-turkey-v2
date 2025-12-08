CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  category VARCHAR(255),
  image TEXT,
  description TEXT
);

INSERT INTO products (name, price, category, image, description) VALUES
("Konya Tahinli Pide", 80, "Yöresel", "", "Taş fırında taze tahinli pide."),
("El Yapımı Cezve", 350, "El Sanatları", "", "Elde dövülmüş bakır cezve."),
("Deri Cüzdan", 420, "Aksesuar", "", "Hakiki el yapımı deri cüzdan.");
