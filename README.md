[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ZjtTJ8eb)
# PS03OpenAIAssistantChatBot
### create a .env file and put in your OPENAI_API_KEY

Usage:

1. Click on the form below the prompt "Select Assistant" to see what assistants are available, choose one, and then click on the "Get Assistant" button. This will set the state in both server and client as desired.
2. Click on the form below the prompt "Select Thread". For now there is only one option - "Create a new thread", because it seems there is no API to list or manage created threads. Choose "Create a new thread" and then click on the "Get Thread" button. This will also update the state in both server and client as desired.
3. Type in your prompt and click on the "Send" button. If you do not specify the assistant or thread before sending the prompt, it will alert you. Sending message will add the message to the thread, run and poll the thread, and get back the message list, the whole of which will be processed into the "Conversation History" box and the latest assistant response in which will be shown in the "Response" box. 
4. It's okay to switch assistant or create a new thread at anytime, but for now it is not able to retrieve previous threads.
