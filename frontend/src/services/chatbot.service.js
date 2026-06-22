import axios from "axios";

const API_URL = "http://localhost:3004/api/chatbot";

export const sendMessage = async (message) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    API_URL,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};