-- bookid自加
CREATE SEQUENCE hzs_book_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_book ALTER COLUMN book_id SET DEFAULT nextval('hzs_book_id_seq');

-- book_copy copy_id自加
CREATE SEQUENCE hzs_book_copy_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_book_copy ALTER COLUMN copy_id SET DEFAULT nextval('hzs_book_copy_id_seq');