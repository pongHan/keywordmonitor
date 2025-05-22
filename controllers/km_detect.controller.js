const KmDetectData = require('../models/km_detect.model.js');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
  try {
    const data = await KmDetectData.create(req.body);
    res.status(201).json({ message: 'Record created successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Error creating record', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const offset = (page - 1) * limit;
    const where = keyword ? { keyword: { [Op.like]: `%${keyword}%` } } : {};

    const { count, rows } = await KmDetectData.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await KmDetectData.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching record', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await KmDetectData.update(req.body, {
      where: { detect_id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating record', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await KmDetectData.destroy({
      where: { detect_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error: error.message });
  }
};