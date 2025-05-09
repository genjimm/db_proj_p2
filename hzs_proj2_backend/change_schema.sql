-- bookid�Լ�
CREATE SEQUENCE hzs_book_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_book ALTER COLUMN book_id SET DEFAULT nextval('hzs_book_id_seq');

-- book_copy copy_id�Լ�
CREATE SEQUENCE hzs_book_copy_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_book_copy ALTER COLUMN copy_id SET DEFAULT nextval('hzs_book_copy_id_seq');

-- rental_id�Լ�
CREATE SEQUENCE hzs_rental_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_rental ALTER COLUMN rental_id SET DEFAULT nextval('hzs_rental_id_seq');


-- customer_id�Լ�
CREATE SEQUENCE hzs_customer_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_customer ALTER COLUMN customer_id SET DEFAULT nextval('hzs_customer_id_seq');

-- author_id auto increment
CREATE SEQUENCE hzs_author_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_author ALTER COLUMN author_id SET DEFAULT nextval('hzs_author_id_seq');


-- sponsor_id�Լ�
CREATE SEQUENCE hzs_sponsor_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_sponsor ALTER COLUMN sponsor_id SET DEFAULT nextval('hzs_sponsor_id_seq');

CREATE SEQUENCE hzs_event_id_seq
  START WITH 1
  INCREMENT BY 1;
ALTER TABLE hzs_event
  ALTER COLUMN event_id
    SET DEFAULT nextval('hzs_event_id_seq');
    
CREATE SEQUENCE hzs_exhibition_access_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_exhibition_access ALTER COLUMN registration_id SET DEFAULT nextval('hzs_exhibition_access_id_seq');

CREATE SEQUENCE hzs_seminar_access_id_seq START WITH 1 INCREMENT BY 1;
ALTER TABLE hzs_seminar_access ALTER COLUMN invitation_id SET DEFAULT nextval('hzs_seminar_access_id_seq');
-- ����constraints

ALTER TABLE HZS_CUSTOMER
ADD CONSTRAINT CK_CUSTOMER_ID_TYPE
CHECK (ID_TYPE IN ('Passport', 'SSN', 'Driver_License'));



ALTER TABLE HZS_SPONSOR
ADD CONSTRAINT CK_SPONSOR_TYPE
CHECK (SPONSOR_TYPE IN ('INDIVIDUAL', 'ORGANIZATION'));

ALTER TABLE hzs_sponsor
  DROP CONSTRAINT IF EXISTS ck_sponsor_type;

-- 2. 按单字符 “I”、“O” 重建约束
ALTER TABLE hzs_sponsor
  ADD CONSTRAINT ck_sponsor_type
    CHECK (sponsor_type IN ('I', 'O'));

ALTER TABLE hzs_sponsor
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT now();


ALTER TABLE HZS_RENTAL
ADD CONSTRAINT CK_RENTAL_DATES
CHECK (
    ACTUAL_RETURN_DATE IS NULL
    OR ACTUAL_RETURN_DATE >= BORROW_DATE
);

ALTER TABLE HZS_PAYMENT
ADD CONSTRAINT CK_PAYMENT_METHOD
CHECK (METHOD IN ('CASH', 'CREDIT', 'DEBIT', 'PAYPAL'));

ALTER TABLE HZS_INVOICE
ADD CONSTRAINT CK_INVOICE_AMOUNT
CHECK (INVOIC__AMOUNT >= 0);

ALTER TABLE HZS_EXHIBITION
ADD CONSTRAINT CK_EXHIBITION_EXPENSE
CHECK (EXPENSE >= 0);

ALTER TABLE HZS_BOOK_COPY 
ADD CONSTRAINT C_STATUS_TYPE 
CHECK(STATUS IN ('AVAILABLE', 'UNAVAILABLE'));

ALTER TABLE HZS_RENTAL 
ADD CONSTRAINT C_RENTAL_STATUS 
CHECK (RENTAL_STATUS IN ('BORROWED', 'RETURNED', 'LATE'));

ALTER TABLE HZS_SEMINAR_SPONSOR 
ADD CONSTRAINT C_SPONSORED_AMOUNT 
CHECK (AMOUNT >= 0);

ALTER TABLE HZS_STUDY_ROOM 
ADD CONSTRAINT C_POSITIVE_CAPACITY 
CHECK (CAPACITY > 0);

ALTER TABLE hzs_exhibition_access
  ADD COLUMN registrant_name  VARCHAR(255)                NOT NULL,
  ADD COLUMN registrant_email VARCHAR(255)                NOT NULL,
  ADD COLUMN registered_at    TIMESTAMP WITH TIME ZONE    NOT NULL
    DEFAULT NOW();

ALTER TABLE hzs_seminar_access
  ADD COLUMN invitee_name  VARCHAR(255)                NOT NULL,
  ADD COLUMN invitee_email VARCHAR(255)                NOT NULL,
  ADD COLUMN invited_at    TIMESTAMP WITH TIME ZONE    NOT NULL
    DEFAULT NOW();