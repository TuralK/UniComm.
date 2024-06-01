const axios = require('axios');
const cheerio = require('cheerio');

// Function to merge cookies from different responses
function mergeCookies(existingCookies, newCookies) {
  const mergedCookies = existingCookies.split('; ').concat(newCookies.split('; '));
  const uniqueCookies = [...new Set(mergedCookies)];
  return uniqueCookies.join('; ');
}

// Step 1: Fetch the initial page to get the hidden token and cookies
async function fetchInitialPage() {
  const url = 'https://www.turkiye.gov.tr/belge-dogrulama';

  const response = await axios.get(url);
  const cookies = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');

  return { data: response.data, cookies };
}

// Step 2: Extract the token from the page using cheerio
function extractToken(html) {
  const $ = cheerio.load(html);
  const token = $('input[name="token"]').val();
  return token;
}

// Step 3: Submit the first form with the extracted token and barcode
async function submitFirstForm(barcode, token, cookies) {
  const url = 'https://www.turkiye.gov.tr/belge-dogrulama?submit';

  const formData = new URLSearchParams();
  formData.append('sorgulananBarkod', barcode);
  formData.append('token', token);
  formData.append('btn', 'Devam Et');

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': cookies,
  };

  const response = await axios.post(url, formData, { headers });
  const mergedCookies = mergeCookies(cookies, response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; '));
  return { data: response.data, cookies: mergedCookies };
}

// Step 4: Extract the token for the second form
function extractSecondToken(html) {
  const $ = cheerio.load(html);
  const token = $('input[name="token"]').val();
  return token;
}

// Step 5: Submit the second form with the T.C. Kimlik Numarası and new token
async function submitSecondForm(tcKimlik, token, cookies) {
  const url = 'https://www.turkiye.gov.tr/belge-dogrulama?islem=dogrulama&submit';

  const formData = new URLSearchParams();
  formData.append('ikinciAlan', tcKimlik);
  formData.append('token', token);
  formData.append('btn', 'Devam Et');

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': cookies,
  };

  const response = await axios.post(url, formData, { headers });
  const mergedCookies = mergeCookies(cookies, response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; '));
  return { data: response.data, cookies: mergedCookies };
}

// Step 6: Extract the token for the third form
function extractThirdToken(html) {
  const $ = cheerio.load(html);
  const token = $('input[name="token"]').val();
  return token;
}

// Step 7: Submit the third form with the checkbox and new token
async function submitThirdForm(token, cookies) {
  const url = 'https://www.turkiye.gov.tr/belge-dogrulama?islem=onay&submit';

  const formData = new URLSearchParams();
  formData.append('chkOnay', '1');
  formData.append('token', token);
  formData.append('btn', 'Devam Et');

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': cookies,
  };

  const response = await axios.post(url, formData, { headers });
  return response;
}

// Exported main function to run the steps and check for success
async function verifyDocument(barcode, tcKimlik) {
  try {
    // Fetch initial page and extract token
    const { data: initialPage, cookies: initialCookies } = await fetchInitialPage();
    const firstToken = extractToken(initialPage);

    // Submit first form and get response
    const { data: firstFormResponse, cookies: firstFormCookies } = await submitFirstForm(barcode, firstToken, initialCookies);
    const secondToken = extractSecondToken(firstFormResponse);

    // Submit second form and get response
    const { data: secondFormResponse, cookies: secondFormCookies } = await submitSecondForm(tcKimlik, secondToken, firstFormCookies);
    const thirdToken = extractThirdToken(secondFormResponse);

    // Submit third form and get final response
    const finalResponse = await submitThirdForm(thirdToken, secondFormCookies);

    // Check if the final response contains the success indicator
    const $ = cheerio.load(finalResponse.data);
    const objectData = $('#pdfPanel object').attr('data');
    const linkText = $('a[href="/belge-dogrulama?belge=goster&goster=1"]').text().trim();
    const success = (objectData!==undefined) && (linkText!==undefined);
    return success;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = {
  mergeCookies,
  fetchInitialPage,
  extractToken,
  submitFirstForm,
  extractSecondToken,
  submitSecondForm,
  extractThirdToken,
  submitThirdForm,
  verifyDocument
};
