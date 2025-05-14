-- 创建自习室表
CREATE TABLE IF NOT EXISTS hzs_room (
    room_id SERIAL PRIMARY KEY,
    capacity INTEGER NOT NULL
);

-- 创建自习室预约表
CREATE TABLE IF NOT EXISTS hzs_room_reservation (
    reservation_id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES hzs_room(room_id),
    topic_description VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    group_size INTEGER NOT NULL,
    reserved_l_name VARCHAR(50) NOT NULL,
    reserved_f_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_room_reservation_room_id ON hzs_room_reservation(room_id);
CREATE INDEX IF NOT EXISTS idx_room_reservation_date ON hzs_room_reservation(date); 