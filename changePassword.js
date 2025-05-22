#!/usr/bin/env node

const { sequelize } = require("./models");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const db = require("./models");

const user = db.user;

// Simple console-based logger
const logger = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg) => console.error(`ERROR: ${msg}`),
};

// Command-line argument parsing
const args = process.argv.slice(2);
const mb_id = args[0];
const newPassword = args[1];

async function changePassword() {
  if (!mb_id || !newPassword) {
    logger.error("Usage: node changePassword.js <mb_id> <new_password>");
    process.exit(1);
  }

  try {
    const userQuery = `SELECT mb_id FROM tb_user WHERE mb_id = :mb_id`;
    const userRows = await sequelize.query(userQuery, {
      replacements: { mb_id },
      type: QueryTypes.SELECT,
    });

    if (!userRows.length) {
      logger.error(`User with mb_id '${mb_id}' does not exist.`);
      process.exit(1);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword.trim(), saltRounds);
    logger.info("New password hashed successfully.");

    const updateResult = await user.update(
      { mb_password2: hashedPassword, updated_at: sequelize.fn("NOW") },
      { where: { mb_id } }
    );

    if (updateResult[0] === 0) {
      logger.error(`Failed to update password for mb_id '${mb_id}'.`);
      process.exit(1);
    }

    logger.info(`Password updated successfully for mb_id '${mb_id}'.`);
    process.exit(0);
  } catch (err) {
    logger.error("Error updating password: " + err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

changePassword();