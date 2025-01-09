import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import MessageInput from '../../components/AI/chatInput.tsx';
import { AIMessage, chatWithAiAgent } from '@/api/ai-agent.api.ts';
import { useAuth } from '@clerk/clerk-react';
import { getUserAPI } from '@/api/users.api.ts';
import { useTaskContext } from '@/contexts/UserTaskContext.tsx';
import { getTasksByUserId } from '@/api/tasks.api.ts';

const ChatAI = () => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'ai'; message: string }[]
  >([]);
  const [userInfo, setUserInfo] = useState({});
  const {userId } = useAuth();
  const { setTasks } = useTaskContext();

  useEffect(() => {
    const getUser = async () => {
      try {
        if (!userId) return;
        const response = await getUserAPI(userId);
        if (response && response.userId) {
          setUserInfo(response);
        }
      } catch (error) {
        console.log(error);        
      }
    }
    getUser();
  }, [userId])

  useEffect(() => {
    const storedChatHistory = sessionStorage.getItem('chatHistory');
    if (storedChatHistory) {
      try {
        setChatHistory(JSON.parse(storedChatHistory));
      } catch (error) {
        console.error('Error parsing stored chat history:', error);
        sessionStorage.removeItem('chatHistory'); // Clear invalid data
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const sendMessage = async () => {
    if (messageInput.trim() !== '') {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'user', message: messageInput },
      ]);
      setMessageInput('');

      console.log('User sent message:', messageInput);

      try {
        // Send message to the AI agent
        if (!userId && typeof userId !== 'string' || !userInfo) {
          alert('userId is invalid');
          return;
        }
        const payload : AIMessage = {
          userId,
          userRole: userInfo.userRole, 
          prompt: messageInput, 
          preferredModel: 'gemini'
        }
        console.log('payload', payload);
        const response: any = await chatWithAiAgent(payload);
        console.log('response from ai agent', response);
        if (response && response.response) {
          setChatHistory((prev) => [
            ...prev,
            { sender: 'ai', message: response.response },
          ]);
          // refresh tasks          
          const newTasks = await getTasksByUserId(userId);
          setTasks(newTasks);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        // Optionally, you can add an error message to the chat history
        const errorMessage = error?.response?.data ? error.response.data.message : 'something went wrong';
        setChatHistory((prev) => [
          ...prev,
          { sender: 'ai', message: errorMessage },
        ]);
      } finally {
      }
    }
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="right-8 bottom-3 z-50 absolute flex justify-center items-center bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-xl p-[1px] rounded-full w-12 h-12">
          <div className="flex justify-center items-center bg-white dark:bg-gradient-to-b dark:from-indigo-600 dark:to-cyan-300 rounded-full w-11 h-11">
            <p className="font-bold text-2xl text-center">🤖</p>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col bg-gradient-to-t from-indigo-50 to-white rounded-l-[26px] sm:max-w-[450px] md:max-w-[500px] h-full">
        <SheetHeader className="flex leading-tight">
          <SheetTitle>💡 Your AI Assistant</SheetTitle>
          <SheetDescription className="text-xs">
            Your assitant
            <hr className="border-gray-300 my-2 w-full" />
          </SheetDescription>
        </SheetHeader>
        {/* Chatbot UI */}
        <div className="flex custom-scrollbar px-1 h-[74%] overflow-y-scroll">
          {/* Chat Messages Container */}
          <div className="space-y-4">
            {/* AI Message */}
            <div className="flex items-start">
              <div className="bg-white shadow-md p-2 rounded-2xl max-w-[80%] text-gray-900 text-sm">
                <p>
                  Hello! I'm your assistant. How can I help you ?
                </p>
              </div>
            </div>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${
                  chat.sender === 'user' ? 'justify-end' : 'items-start'
                }`}
              >
                <div
                  className={`shadow-md p-2 rounded-2xl max-w-[80%] text-sm ${
                    chat.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <p>{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
          {}
        </div>
        {/* Chat Input */}
        <MessageInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          sendMessage={sendMessage}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ChatAI;
