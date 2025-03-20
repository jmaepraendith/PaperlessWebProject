import React, { useState, useEffect } from "react";
import "../styles/ActivityPage.css";
import axios from "axios";
import { useNavigate,useParams } from 'react-router-dom';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  const { username } = useParams();
  const [editingId, setEditingId] = useState(null);  // Track the file being edited
  const [editedName, setEditedName] = useState(""); 

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`http://localhost:13889/paperless/activities/${username}`);
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };
    if (username) { // Ensure username exists before fetching
      fetchActivities();
    }
  }, [username]);

  // Function to handle double-click to edit
  const handleDoubleClick = (file_ID, currentName) => {
    setEditingId(file_ID);
    setEditedName(currentName);
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    setEditedName(e.target.value);
  };

  // Function to handle saving when pressing Enter
  const handleSave = async (file_ID) => {
    try {
      await axios.put(`http://localhost:13889/paperless/projects/update/${file_ID}`, {
        file_name: editedName
      });

      // Update UI immediately
      setActivities(activities.map(activity =>
        activity.file_ID === file_ID ? { ...activity, file_name: editedName } : activity
      ));

      setEditingId(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating file name:", error);
    }
  };

  const handleDownload = async (file_ID) => {
    try {
        const response = await axios.get(`http://localhost:13889/paperless/getExcelFile/${file_ID}`, {
            responseType: 'blob' // Important for file downloads
        });

        // Create a link to trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Project_${file_ID}.xlsx`); // Set file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
};


  return (
    <div className="activity-container">
      <header>
        <img src="/headerLogo.png" alt="Paperless Flow Logo" className="logo-activity" />
        <nav className="nav-header">
          <p>
            <button className="HomeLink" onClick={() => navigate(`/homepage/${username}`)}>
              <a>Home</a>
            </button>
          </p>
          <p className="AboutUsLink"><a>About us</a></p>
          <p className="AllToolsLink"><a>All Tools</a></p>
          <p className="UserLink"><a>Welcome, {username}!</a></p>
        </nav>
      </header>

      <main>
        <h1 className="Activity-h1">Activity</h1>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <section className="activity" key={index}>
              <div className="date">{activity.date}</div>
              <div className="activity-item">
                <span className="folder-icon">📁</span>

                 {/* Editable File Name */}
                 {editingId === activity.file_ID ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={handleInputChange}
                    onBlur={() => handleSave(activity.file_ID)} // Save on blur
                    onKeyDown={(e) => e.key === "Enter" && handleSave(activity.file_ID)} // Save on Enter
                    autoFocus
                    className="file-name-input"
                  />
                ) : (
                  <span
                    className="file-name"
                    onDoubleClick={() => handleDoubleClick(activity.file_ID, activity.file_name)}
                  >
                    {activity.file_name}
                  </span>
                )}

                {/* <span className="file-name">{activity.file_name}</span> */}
                <button className="btn preview">Preview</button>
                <button className="btn download" onClick={() => handleDownload(activity.file_ID)}>Download</button>
              </div>
            </section>
          ))
        ) : (
          <p>You haven't created any project yet.</p>
        )}
      </main>
    </div>
  );
};

export default ActivityPage;