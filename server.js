// Load environment variables
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
// If using Node.js < 18, uncomment the next line
// const fetch = require('node-fetch');

const app = express();
const PORT = 3000;
const LIMIT = 10;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// State dictionary
let state = {
  assistant_id: null,
  assistant_name: null,
  thread_id: null,
  messages: [],
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


// Route to list all Assistants
app.get('/api/assistants/list', async (req, res) => {
  try {
    let response = await openai.beta.assistants.list({
      limit: LIMIT
    });
    
    res.json({ assistant_id_list: response.data });
  }
  catch (error) {
    console.error('Error listing assistants:', error);
    res.status(500).json({ error: 'Failed to list assistants' });
  }
});

// Route to retrieve an Assistant
app.post('/api/assistants/:assistant_id', async (req, res) => {
  let assistant_id = req.body.name;
  try {
    let myAssistant = await openai.beta.assistants.retrieve(
      assistant_id
    );

    state.assistant_id = myAssistant.id;
    state.assistant_name = myAssistant.name;
    state.thread_id = null;
    state.messages = [];
    res.status(200).json(state);
  }
  catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({ error: 'Failed to fetch assistants' });
  }
});

// Route to list all Threads created for an Assistant
// Unimplemented (it seems that for now we cannot list or manage threads in the OpenAI API)
// app.get('/api/threads/list', async (req, res) => {
//   const assistantId = state.assistant_id;
//   try {
//     let response = await openai.beta.threads.list({
//       assistant_id: assistantId, 
//       limit: LIMIT
//     });
    
//     res.json({ thread_id_list: response.data });
//   }
//   catch (error) {
//     console.error('Error listing threads:', error);
//     res.status(500).json({ error: 'Failed to list threads' });
//   }
// });

// Route to create a new Thread
app.post('/api/threads/new', async (req, res) => {
  try {
    let thread = await openai.beta.threads.create();

    state.thread_id = thread.id;
    state.messages = []; // Reset messages
    res.json({ thread_id: state.thread_id });
  }
  catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// Route to retrieve a Thread
// Unimplemented (it seems that for now we cannot list or manage threads in the OpenAI API)
// app.post('/api/threads/:thread_id', async (req, res) => {
//   const { thread_id } = req.params;
//   try {
//     let response = await openai.beta.threads.messages.list(thread_id);

//     state.thread_id = thread_id;
//     state.messages = response.data;
//     res.json({ messages: response.data });
//   }
//   catch (error) {
//     console.error('Error retrieving thread message:', error);
//     res.status(500).json({ error: 'Failed to retrieve thread message' });
//   }
// });

// Route to send a message and run the Assistant
app.post('/api/run', async (req, res) => {
  const thread_id = state.thread_id;
  const { message } = req.body;
  state.messages.unshift({ role: 'user', content: message });
  try {
    // Add user message to thread
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message,
    });

    // Run and poll thread V2 API feature
    let run = await openai.beta.threads.runs.createAndPoll(thread_id, {
        assistant_id: state.assistant_id
    })
    
    // Get assistant message and update state
    let response = await openai.beta.threads.messages.list(thread_id);
    console.log(JSON.stringify(response.data.slice(0, 2), null, 2));

    let assistant_message = response.data.find((msg) => msg.role === 'assistant').content[0].text.value
    
    if (assistant_message) {
      state.messages.unshift({ role: 'assistant', content: assistant_message});
    }

    res.json({ messages: state.messages });
  }
  catch (error) {
    console.error('Error running assistant:', error);
    res.status(500).json({ error: 'Failed to run assistant' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// TODO: 4. list and retrieve thread