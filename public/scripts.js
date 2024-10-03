// Initiate the state object with the assistant_id and threadId as null and an empty array for messages
let state = {
  assistant_id: null,
  assistant_name: null,
  thread_id: null,
  messages: [],
};

let loadingInterval;

async function loadAssistants(){
  try {
    const response = await fetch('/api/assistants/list');
    const data = await response.json();
    
    const assistantSelect = document.getElementById('assistantSelect');
    assistantSelect.innerHTML = '';

    const option = document.createElement('option');
    assistantSelect.appendChild(option);

    data.assistant_id_list.forEach((assistant) => {
      const option = document.createElement('option');
      option.value = assistant.id;
      option.text = assistant.name
      assistantSelect.appendChild(option);
    });
  }
  catch (error) {
    console.error('Error listing assistants:', error);
  }
}

async function getAssistant(){
  const selected_assistant_id = document.getElementById('assistantSelect').value;
  if (!selected_assistant_id) {
    alert('Please select an assistant');
    return;
  }
  const response = await fetch(`/api/assistants/${selected_assistant_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: selected_assistant_id }),
  });

  const data = await response.json();
  state.assistant_id = data.assistant_id;
  state.assistant_name = data.assistant_name;
  state.thread_id = data.thread_id;
  state.messages = data.messages;

  loadThreads();
  writeToMessages(`Assistant ${data.assistant_name} is retrieved`);
  renderConversation();
}

async function loadThreads(){
  // const response = await fetch('/api/threads/list');
  // const data = await response.json();
  
  const threadSelect = document.getElementById('threadSelect');
  threadSelect.innerHTML = '';

  const option_blank = document.createElement('option');
  threadSelect.appendChild(option_blank);

  const option_create = document.createElement('option');
  option_create.value = 'new';
  option_create.text = 'Create a new thread';
  threadSelect.appendChild(option_create);

  // data.thread_id_list.forEach((thread) => {
  //   const option = document.createElement('option');
  //   option.value = thread.id;
  //   option.text = thread.id
  //   threadSelect.appendChild(option);
  // });
}

async function getThread(){
  const selected_thread_id = document.getElementById('threadSelect').value;
  if (!selected_thread_id) {
    alert('Please select a thread');
    return;
  } else if (selected_thread_id === 'new') {
    // Create a new thread
    const response = await fetch('/api/threads/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    state.thread_id = data.thread_id;
    state.messages = [];
    writeToMessages(`New thread ${data.thread_id} is created`);
    renderConversation();
    return;
  } else {
    // Unimplemented (it seems that for now we cannot list or manage threads in the OpenAI API)
    return;
  }
}

async function getResponse(){
  if (state.assistant_id === null || state.thread_id === null) {
    alert('Please select an assistant and a thread');
    return;
  }
  const messageInput = document.getElementById('messageInput').value.trim();
  if (!messageInput) {
    alert('Please enter a message');
    return;
  }
  document.getElementById('messageInput').value = '';
  
  startLoading();

  const response = await fetch('/api/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: messageInput }),
  });
  const data = await response.json();
  
  stopLoading();

  state.messages = data.messages;
  writeToMessages(data.messages[0].content);
  renderConversation();
}

async function writeToMessages(message){
  let messageDiv = document.getElementById("messages");
  messageDiv.innerHTML = message.replace(/\n/g, '<br>');
}

function renderConversation(){
  const messageContainer = document.getElementById('message-container');
  messageContainer.innerHTML = '';

  state.messages.forEach((message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', message.role);
    messageElement.innerHTML = message.content.replace(/\n/g, '<br>');
    messageContainer.appendChild(messageElement);
  });

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function startLoading(){
  const messageDiv = document.getElementById("messages");
  let dots = '';
  loadingInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    messageDiv.innerHTML = `Loading${dots}`;
  }, 500);
}

function stopLoading(){
  clearInterval(loadingInterval);
  document.getElementById("messages").innerHTML = '';
}

document.addEventListener('DOMContentLoaded', loadAssistants);