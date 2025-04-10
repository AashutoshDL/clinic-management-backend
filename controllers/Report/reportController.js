const Template = require('../../models/reportModel');
const { successResponse, errorResponse, messageResponse } = require('../../utils/responseHandler');

module.exports.createReportTemplate = async (req, res) => {
  try {
    const { title, customFields } = req.body;

    if (!title || !Array.isArray(customFields)) {
      return messageResponse(res, 400, "Title and custom fields are required");
    }

    const newTemplate = new Template({
      title,  
      customFields
    });
    await newTemplate.save();
    successResponse(res, 201, newTemplate, "Template created successfully");
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal Server Error");
  }
};


module.exports.getReportTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      return messageResponse(res, 404, "Template not found");
    }

    successResponse(res, 200, template, "Template fetched successfully");
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal Server Error");
  }
};

module.exports.updateReportTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customFields were provided in the request body for partial update
    if (req.body.customFields && Array.isArray(req.body.customFields)) {
      // Handle updating specific custom fields based on their _id
      for (let i = 0; i < req.body.customFields.length; i++) {
        const fieldUpdate = req.body.customFields[i];
        const { _id, ...updateData } = fieldUpdate;

        // Update only the specific custom field by _id
        await Template.updateOne(
          { _id: id, 'customFields._id': _id }, // Find template and specific field
          {
            $set: {
              'customFields.$': { ...updateData }, // Update the specific field's values
            },
          }
        );
      }
    }

    // If other fields (like title) need to be updated, handle them separately
    if (req.body.title) {
      await Template.findByIdAndUpdate(id, { title: req.body.title }, { new: true });
    }

    // After updates, retrieve the updated template
    const updatedTemplate = await Template.findById(id);

    if (!updatedTemplate) {
      return messageResponse(res, 404, "Template not found");
    }

    successResponse(res, 200, updatedTemplate, "Template updated successfully");
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};


module.exports.deleteReportTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTemplate = await Template.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return messageResponse(res, 404, "Template not found");
    }

    successResponse(res, 200, null, "Template deleted successfully");
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};

module.exports.getAllReportTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    successResponse(res, 200, templates, "Templates fetched successfully");
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};
