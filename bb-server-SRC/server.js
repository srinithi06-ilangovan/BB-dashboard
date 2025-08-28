import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import jiraRoutes from './routes/jiraRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// jira api
app.use('/api', jiraRoutes);

// github login api
// app.get('/github/login', (req, res) => {
//   const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${process.env.GITHUB_CALLBACK_URL}`;
//   res.redirect(githubAuthUrl);
// });



app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${process.env.GITHUB_CALLBACK_URL}`;
  res.redirect(githubAuthUrl);
});
// github callback api

app.get('/github/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
        scope: 'repo'
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    await checkCollaboratorStatus(accessToken, req, res);
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).send('Authentication failed.');
  }
});


const checkCollaboratorStatus = async (accessToken, req, res) => {
  const owner = `${process.env.GITHUB_OWNER_NAME}`
  const repo = `${process.env.GITHUB_REPO_NAME}`;

  try {
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const username = userResponse.data.login;

    await axios.get(`https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    res.redirect('https://santhanakumarm24.github.io/AgileKanbanBoard');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Error checking collaborator status:', error.response.data);
      console.error('Error status:', error.response.status);
      res.status(403).send('<h1>Access Denied: You are not a collaborator on this repository.</h1>');
    } else {
      console.error('Error checking collaborator status:', error);
      res.status(500).send('An error occurred.');
    }
  }
};

// gemini gen ai api
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/ai-report", async (req, res) => {
  const { data, prompt } = req.body;
  // console.log(data,'data',prompt,'prompt')
  if (!data || !prompt) return res.status(400).json({ error: "Missing data or prompt" });
  try {
    const completion = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      // model: 'gemini-2.0-flash-001',
      contents: [
        {
          parts: [
            { text: `${prompt}` },
            { text: `Data to analyze: ${JSON.stringify(data)}` } // Convert data to a string
          ],
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.95,
        topK: 40,

      }
    })
    // console.log(completion.candidates[0].content.parts[0].JSON,'completion===========> ')
    res.send({ reply: completion.text });

  } catch (error) {
    console.error("Error from Gemini API:", error);
    if (error.response && error.response.status) {
      res.status(error.response.status).json({
        error: `API Error ${error.response.status}: ${error.response.statusText || error.message}. ${error.response.data ? JSON.stringify(error.response.data) : ''}`
      });
    }
    else {
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ error: 'Something went wrong on the server.' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
