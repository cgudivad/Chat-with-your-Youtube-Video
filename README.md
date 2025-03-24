# How to Chat with your Youtube Video

## Prerequisites:
Install Python and pip.

## Step 1: Create a virtual environment and Install the required packages:

```bash
$ python3 -m venv .venv
$ source .venv/bin/activate
$ pip install -r requirements.txt
```

## Step 2: Set Up Environment Variables
  ### 2.1: Create OpenAI and Pinecone accounts and get the API Keys, Endpoints.

  1. **OpenAI:** https://platform.openai.com/api-keys
  2. **Pinecone:** https://app.pinecone.io/

  ### 2.2: Create a .env file in the root directory of your project and fill in the following details:
```plaintext
SECRET_KEY=Enter your Flask Application Secret Key here

EMBEDDINGS_MODEL=Enter your Embedding Model here
OPENAI_API_KEY=Enter your OpenAI API key here

ANTHROPIC_API_KEY=Enter your Anthropic API key here

PINECONE_INDEX_NAME=Enter your Pinecone Index Name here
PINECONE_API_ENV=Enter your Pinecone Environment endpoint here
PINECONE_API_KEY=Enter your Pinecone API key here
```

## Step 3: Run the Application
Execute the application.py file using Python. This will start the Flask application:
```bash
$ python application.py
```

## Step 4: Enjoy your experience with the application!
Load your video and ask your questions.

![image](https://github.com/cgudivad/Chat-with-your-Youtube-Video/assets/126507537/62a48673-938f-49ae-919d-2cfc1e6efcf8)

## Credits
#### This application is inspired by an Youtube Video made by **Underfitted**: https://www.youtube.com/watch?v=BrsocJb-fAo
#### Check out his channel for more interesting videos: https://www.youtube.com/@underfitted
