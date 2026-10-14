-- ----------------------------------------------------
-- Seed data for the violation_rules table (PostgreSQL)
-- ----------------------------------------------------

INSERT INTO violation_rules (violation_code, description, points_awarded, base_fine) VALUES
('NO_HELMET', 'Riding without a helmet', 50, 500.00),
('TRIPLE_RIDING', 'More than two persons on a two-wheeler', 75, 1000.00),
('WRONG_SIDE', 'Driving or riding against the flow of traffic', 100, 1500.00),
('NO_ENTRY', 'Violation of a no-entry zone sign', 60, 800.00),
('JUMP_LIGHT', 'Jumping a red traffic signal', 150, 2000.00)
ON CONFLICT (violation_code) DO NOTHING;
-- ON CONFLICT ensures that running this script multiple times won't create duplicate records.