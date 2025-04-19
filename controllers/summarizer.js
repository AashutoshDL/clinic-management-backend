const express = require('express');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const path = require('path');


const MODEL_NAME=process.env.MODEL_NAME;
const HUGGING_FACE_API_TOKEN=process.env.HUGGING_FACE_API_TOKEN;

//downloading the pdf
const downloadPDF = async (url, dest) => {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(dest, response.data);
    } catch (error) {
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
  };` `
  
  const extractTextFromPDF = (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    return pdfParse(dataBuffer)
      .then(data => data.text)
      .catch(() => '');
  };
  
  const extractTextWithOCR = async (filePath) => {
    const text = await Tesseract.recognize(filePath, 'eng');
    return text.data.text;
  };
  
  const generateSummary = async (text) => {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
        {
          inputs: text,
          parameters: { max_length: 130, min_length: 30, do_sample: false }
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const result = response.data;
  
      if (result.error) throw new Error(result.error);
      return result[0].summary_text;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  module.exports.summarizer= async (req, res) => {
    try {
      const { pdfUrl } = req.body;
      if (!pdfUrl) {
        return res.status(400).json({ error: 'pdfUrl is required in request body' });
      }
  
      const tempFilePath = path.join(__dirname, 'temp.pdf');
  
      await downloadPDF(pdfUrl, tempFilePath);
  
      let text = await extractTextFromPDF(tempFilePath);
  
      if (!text || text.length < 20) {
        console.log("No text found using pdf-parse. Trying OCR...");
        text = await extractTextWithOCR(tempFilePath);
      }
  
      if (!text) {
        throw new Error("Unable to extract text from PDF.");
      }
  
      const trimmedText = text.substring(0, 1024);
  
      const summary = await generateSummary(trimmedText);
  
      fs.unlinkSync(tempFilePath);
  
      res.json({ summary });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };