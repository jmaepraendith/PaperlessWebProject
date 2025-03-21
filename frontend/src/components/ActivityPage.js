import React, { useState, useEffect } from "react";
import "../styles/ActivityPage.css";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  const { username } = useParams();
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`http://localhost:13889/paperless/activities/${username}`);
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };
    if (username) {
      fetchActivities();
    }
  }, [username]);

  const handleDoubleClick = (file_ID, currentName) => {
    setEditingId(file_ID);
    setEditedName(currentName);
  };

  const handleInputChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleSave = async (file_ID) => {
    try {
      await axios.put(`http://localhost:13889/paperless/projects/update/${file_ID}`, {
        file_name: editedName
      });

      setActivities(activities.map(activity =>
        activity.file_ID === file_ID ? { ...activity, file_name: editedName } : activity
      ));

      setEditingId(null);
    } catch (error) {
      console.error("Error updating file name:", error);
    }
  };

  const handleDownload = async (file_ID) => {
    try {
      const response = await axios.get(`http://localhost:13889/paperless/getExcelFileallcolumn/${file_ID}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Project_${file_ID}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="activity-container">
      <div className="three-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      
      <header>
        <div className="header-left">
          <img src="/headerLogo.png" alt="Paperless Flow Logo" className="logo-activity" />
          {/* Hamburger menu moved here - next to logo */}
          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <nav className={`nav-header ${menuOpen ? 'nav-open' : ''}`}>
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

                {editingId === activity.file_ID ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={handleInputChange}
                    onBlur={() => handleSave(activity.file_ID)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave(activity.file_ID)}
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