
create TABLE userschema (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    isActivated BOOLEAN DEFAULT false,
    activationLink TEXT
);


create TABLE tokenschema (
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES userschema (id), 
    refreshToken VARCHAR(255) 
);