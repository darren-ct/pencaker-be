ALTER TABLE apply ADD FOREIGN KEY(member_id) REFERENCES user(id) ON DELETE CASCADE;
ALTER TABLE apply ADD FOREIGN KEY(job_id) REFERENCES job(id) ON DELETE CASCADE;

ALTER TABLE job ADD FOREIGN KEY(company_id) REFERENCES user(id) ON DELETE CASCADE;

ALTER TABLE transaction ADD FOREIGN KEY(job_id) REFERENCES job(id) ON DELETE SET NULL;
ALTER TABLE transaction ADD FOREIGN KEY(company_id) REFERENCES user(id) ON DELETE SET NULL;
