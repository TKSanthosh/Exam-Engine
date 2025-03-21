CREATE TABLE user_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    exam_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subject_data (
    sid INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(255) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    exam_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(255),
  question_text TEXT,
  option_a VARCHAR(255),
  option_b VARCHAR(255),
  option_c VARCHAR(255),
  option_d VARCHAR(255),
  correct_ans VARCHAR(1),
  mark INT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

