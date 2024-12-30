import './App.css';
import { useState, ChangeEvent } from 'react';
import Papa from 'papaparse';
import { DiscordMessage } from './fetchMessages';

function App() {
  const [formValues, setFormValues] = useState({
    userToken: '',
    channelId: '',
    startDate: '',
    endDate: '',
    username: '',
    buffer: '',
  });

  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.values(formValues).some((value) => value.trim() === '')) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    setIsLoading(true); // Start loading animation

    try {
      const { userToken, channelId, startDate, endDate, buffer } = formValues;
      const timeBuffer = parseInt(buffer) * 1000;

      const messages = await window.electron.fetchMessages({
        token: userToken,
        channelId: channelId,
        startDate: startDate,
        endDate: endDate,
        timeBuffer: timeBuffer,
      });

      if (messages.length === 0) {
        alert('No messages found in the specified date range.');
        setIsLoading(false); // Stop loading animation
        return;
      }

      // Transform messages into a CSV format
      const csvData = messages.map((message: DiscordMessage) => ({
        ID: message.id,
        Timestamp: message.timestamp,
        Content: message.content,
        Author: message.author.username,
        EmbedDescription: message.embeds?.map((embed: { description?: string }) => embed.description || '').join('; '),
      }));

      const csv = Papa.unparse(csvData);

      const success = await window.electron.saveFile('messages.csv', csv);
      if (success) {
        alert(`CSV file with ${messages.length} messages has been downloaded.`);
      } else {
        alert('CSV file save operation canceled.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('An error occurred while fetching messages. Check the console for details.');
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  const totalFields = Object.keys(formValues).length;
  const filledFields = Object.values(formValues).filter((value) => value.trim() !== '').length;
  const progressPercentage = (filledFields / totalFields) * 100;

  return (
    <div className="top">
      <div>
        <img src="./discord-mark-blue.svg" width={100} style={{ margin: 5 }} alt="Discord logo" />
      </div>
      <form onSubmit={handleSubmit}>
        <label className="label">USER TOKEN</label>
        <br />
        <input
          type="text"
          placeholder="Enter User Token"
          className="form"
          name="userToken"
          value={formValues.userToken}
          onChange={handleChange}
        />
        <br />
        <label className="label">CHANNEL ID</label>
        <br />
        <input
          type="text"
          placeholder="Enter Channel ID"
          className="form"
          name="channelId"
          value={formValues.channelId}
          onChange={handleChange}
        />
        <br />
        <label className="label">START DATE</label>
        <br />
        <input
          type="text"
          placeholder="Example: 2024-12-25"
          className="form"
          name="startDate"
          value={formValues.startDate}
          onChange={handleChange}
        />
        <br />
        <label className="label">END DATE</label>
        <br />
        <input
          type="text"
          placeholder="Example: 2025-01-25"
          className="form"
          name="endDate"
          value={formValues.endDate}
          onChange={handleChange}
        />
        <br />
        <label className="label">NAME / NICKNAME</label>
        <br />
        <input
          type="text"
          placeholder="Enter Nickname for tracking"
          className="form"
          name="username"
          value={formValues.username}
          onChange={handleChange}
        />
        <br />
        <label className="label">BUFFER</label>
        <br />
        <input
          type="text"
          placeholder="Recommended: 3"
          className="form"
          name="buffer"
          value={formValues.buffer}
          onChange={handleChange}
        />
        <br />
        <div className="progress-bar-container" style={{ margin: '10px 0' }}>
          <div
            className="progress-bar"
            style={{
              width: `${progressPercentage}%`,
              height: '10px',
              backgroundColor: '#4caf50',
            }}
          ></div>
        </div>
        <input type="submit" className="button" value="GENERATE CSV" />
        {isLoading && (
          <div className="loading-gear-container">
            <div className="loading-gear"></div>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
