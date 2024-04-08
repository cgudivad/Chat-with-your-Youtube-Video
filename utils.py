import os
from dotenv import load_dotenv
from langchain_openai.chat_models import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()

YT_API_KEY = os.getenv("YT_API_KEY")
YT_API_URL = os.getenv("YT_API_URL")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL")

parser = StrOutputParser()
template = """
Answer the question based on the context below. If you can't answer the question, reply "As per the context provided, I am unable to answer your question. Please try a different question".

Context: {context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=20)
embeddings = OpenAIEmbeddings(model=EMBEDDINGS_MODEL)
model_map = {"gpt-3.5-turbo": 5, "gpt-4-turbo-preview": 10}

def get_video_id(url):
    if "youtube.com/watch" in url:
        video_id = url.split("youtube.com/watch?v=")[-1].split("&")[0]
    elif "youtube.com/live" in url:
        video_id = url.split("youtube.com/live/")[1].split("?")[0]
    elif "youtu.be/" in url:
        video_id = url.split("youtu.be/")[1].split("?")[0]
    else:
        video_id = url
    return video_id

def get_name_space(video_id):
    return video_id.lower().replace("_", "-")

def get_name_spaces():
    return Pinecone().Index(PINECONE_INDEX_NAME).describe_index_stats()['namespaces']

def get_transcript(video_id):

    transcript = None
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    except Exception as e:
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            for transcript_obj in transcript_list:
                if transcript_obj.is_translatable:
                    try:
                        transcript = transcript_obj.translate('en').fetch()
                        break
                    except Exception as e:
                        print(e)
        except Exception as e:
            print(e)

    if transcript is None:
        return ("error", "No transcript found")
    return ("success", ' '.join(item['text'] for item in transcript))

def upsert_transcript(data, url, name_space):
    try:
        doc = Document(
                page_content=data,
                metadata={"source": url}
            )
        documents = text_splitter.split_documents([doc])
        PineconeVectorStore.from_documents(
            documents, embeddings, index_name=PINECONE_INDEX_NAME, namespace=name_space
        )
    except Exception as e:
        return ("error", e)
    return ("success", name_space)

def load(url):
    video_id = get_video_id(url)
    name_space = get_name_space(video_id)
    name_spaces = get_name_spaces()
    
    if name_space not in name_spaces:
        print("creating name space: ", name_space)
        status, data = get_transcript(video_id)
        
        if status != "success":
            return ("error", data)
        
        status, message = upsert_transcript(data, url, name_space)

        if status != "success":
            return ("error", message)

    return ("success", name_space)

def generate(model, name_space, question):
    model_obj = ChatOpenAI(model=model, streaming=True)
    pinecone = PineconeVectorStore(
            embedding=embeddings, index_name=PINECONE_INDEX_NAME, namespace=name_space
        )
    chain = (
    {"context": pinecone.as_retriever(k=model_map[model]), "question": RunnablePassthrough()}
        | prompt
        | model_obj
        | parser
    )

    return chain.stream(question)


if __name__ == "__main__":
    # import time
    # start_time = time.time()
    # status, name_space = load("https://www.youtube.com/watch?v=kfrbkm_nmak")
    # end_time = time.time()
    # print("load Elapsed time:", end_time - start_time, "seconds")
    # start_time = time.time()
    # for chunk in generate("gpt-4-turbo-preview", get_name_space("java-interview-questions"), "what is the life cycle of servlet?"):
    #     print(chunk)
    # end_time = time.time()
    # print("generate Elapsed time:", end_time - start_time, "seconds")
    pass
    