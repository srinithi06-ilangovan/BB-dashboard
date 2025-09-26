import { GoogleGenAI } from '@google/genai';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import jiraRoutes from './routes/jiraRoutes.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);
const corsOptions = {
  origin: 'https://srinithi06-ilangovan.github.io', // Your React app's URL
  credentials: true, // This is crucial for sending and receiving cookies
};
app.use(cors(corsOptions));

app.use(session({
  secret: process.env.SESSION_SECRET, // A secret string for signing the session ID cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Set to true if you are using https
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    maxAge: 24 * 60 * 60 * 1000, // Session duration (e.g., 24 hours)
    sameSite: 'None'
  }
}));
app.use(express.json());
// jira api
app.use('/api', jiraRoutes);

app.get('/api/auth/status', (req, res) => {
  if (req.session.isCollaborator) {
    res.json({
      isAuthenticated: true,
      username: req.session.username // Send some user data back
    });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

app.post('/api/logout', (req, res) => {
  // Check if a session exists before trying to destroy it
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Could not log out.');
      }
      // Success: Send a 200 OK response
      res.status(200).send('Logged out successfully.');
      
    });
  } else {
    // No active session to destroy
    res.status(200).send('No active session.');
  }
});

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

    req.session.isCollaborator = true;
    req.session.username = username;


    res.redirect(`https://srinithi06-ilangovan.github.io/BB-dashboard/?auth=success`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Error checking collaborator status:', error.response.data);
      console.error('Error status:', error.response.status);
      res.status(403).send('Access Denied: You are not a collaborator on this repository.');
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
      model: 'gemini-2.5-flash-lite',
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
