DROP TABLE IF EXISTS 
    common_area_image,
    apartment_image,
    tower_image,
    residential_unit_document,
    residential_unit_image,
    residential_unit_email,
    residential_unit_phone,
    person_image,
    person_phone,
    person_email,
    common_area,
    vehicle,
    parking,
    parking_zone,
    role_permission,
    person_role,
    permission,
    role,
    apartment,
    floor,
    tower,
    residential_unit,
    person
CASCADE;

CREATE TABLE person (
id SERIAL PRIMARY KEY,
document_type VARCHAR NOT NULL,
document_number VARCHAR UNIQUE NOT NULL,
full_name VARCHAR NOT NULL,
gender VARCHAR,
photo_url VARCHAR,
birth_date DATE,
notes TEXT,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE residential_unit (
id SERIAL PRIMARY KEY,
name VARCHAR NOT NULL,
address VARCHAR NOT NULL,
tax_id VARCHAR,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE tower (
id SERIAL PRIMARY KEY,
residential_unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
name VARCHAR NOT NULL,
floor_count INTEGER NOT NULL,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE floor (
id SERIAL PRIMARY KEY,
tower_id INTEGER REFERENCES tower(id) ON DELETE CASCADE,
number INTEGER NOT NULL,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE apartment (
id SERIAL PRIMARY KEY,
floor_id INTEGER REFERENCES floor(id) ON DELETE CASCADE,
tower_id INTEGER REFERENCES tower(id) ON DELETE CASCADE,
code VARCHAR UNIQUE NOT NULL,
area_m2 DECIMAL,
occupancy_status VARCHAR NOT NULL,
ownership_status VARCHAR NOT NULL,
is_habitable BOOLEAN NOT NULL DEFAULT TRUE,
description TEXT,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE role (
id SERIAL PRIMARY KEY,
name VARCHAR NOT NULL,
description TEXT,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE permission (
id SERIAL PRIMARY KEY,
code VARCHAR UNIQUE NOT NULL,
description TEXT NOT NULL,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE person_role (
id SERIAL PRIMARY KEY,
person_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
role_id INTEGER REFERENCES role(id) ON DELETE CASCADE,
apartment_id INTEGER REFERENCES apartment(id),
residential_unit_id INTEGER REFERENCES residential_unit(id),
is_active BOOLEAN NOT NULL DEFAULT TRUE,
from_date DATE NOT NULL,
to_date DATE
);


CREATE TABLE role_permission (
id SERIAL PRIMARY KEY,
role_id INTEGER REFERENCES role(id) ON DELETE CASCADE,
permission_id INTEGER REFERENCES permission(id) ON DELETE CASCADE,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE parking_zone (
id SERIAL PRIMARY KEY,
residential_unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
name VARCHAR NOT NULL,
description TEXT,
alias VARCHAR,
image_url VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE parking (
id SERIAL PRIMARY KEY,
zone_id INTEGER REFERENCES parking_zone(id) ON DELETE CASCADE,
number VARCHAR NOT NULL,
is_assigned BOOLEAN NOT NULL DEFAULT FALSE,
apartment_id INTEGER REFERENCES apartment(id),
alias VARCHAR,
image_url VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE vehicle (
id SERIAL PRIMARY KEY,
person_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
type VARCHAR NOT NULL,
plate VARCHAR UNIQUE NOT NULL,
color VARCHAR NOT NULL,
brand VARCHAR NOT NULL,
model VARCHAR NOT NULL,
photo_url VARCHAR,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE common_area (
id SERIAL PRIMARY KEY,
residential_unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
name VARCHAR NOT NULL,
type VARCHAR NOT NULL,
capacity INTEGER NOT NULL,
location VARCHAR NOT NULL,
requires_reservation BOOLEAN NOT NULL DEFAULT FALSE,
schedule VARCHAR,
description TEXT,
alias VARCHAR,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE person_email (
person_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
email VARCHAR NOT NULL,
PRIMARY KEY (person_id, email)
);

CREATE TABLE person_phone (
person_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
phone VARCHAR NOT NULL,
PRIMARY KEY (person_id, phone)
);

CREATE TABLE person_image (
person_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
image_url VARCHAR NOT NULL,
PRIMARY KEY (person_id, image_url)
);

CREATE TABLE residential_unit_phone (
unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
phone VARCHAR NOT NULL,
PRIMARY KEY (unit_id, phone)
);

CREATE TABLE residential_unit_email (
unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
email VARCHAR NOT NULL,
PRIMARY KEY (unit_id, email)
);

CREATE TABLE residential_unit_image (
unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
image_url VARCHAR NOT NULL,
PRIMARY KEY (unit_id, image_url)
);

CREATE TABLE residential_unit_document (
unit_id INTEGER REFERENCES residential_unit(id) ON DELETE CASCADE,
type VARCHAR NOT NULL,
url VARCHAR NOT NULL,
description TEXT,
PRIMARY KEY (unit_id, type, url)
);

CREATE TABLE tower_image (
tower_id INTEGER REFERENCES tower(id) ON DELETE CASCADE,
image_url VARCHAR NOT NULL,
PRIMARY KEY (tower_id, image_url)
);

CREATE TABLE apartment_image (
apartment_id INTEGER REFERENCES apartment(id) ON DELETE CASCADE,
image_url VARCHAR NOT NULL,
PRIMARY KEY (apartment_id, image_url)
);

CREATE TABLE common_area_image (
area_id INTEGER REFERENCES common_area(id) ON DELETE CASCADE,
image_url VARCHAR NOT NULL,
PRIMARY KEY (area_id, image_url)
);

