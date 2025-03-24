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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

  useEffect(() => {
    // Close user dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userDropdownOpen]);

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

  const handleDelete = async (file_ID) => {
    if (!file_ID) {
        alert("Error: File ID is missing.");
        return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
    
    if (!confirmDelete) {
        return; 
    }

    try {
        const response = await axios.delete(`http://localhost:13889/paperless/deleteProject/${file_ID}`);

        if (response.status === 200) {
            alert("Your project has been deleted successfully!");
            window.location.reload(); // Refresh the page or redirect as needed
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project. Please try again.");
    }
  };

  const handlePreview = async (file_ID) => {
    if (!file_ID) {
        alert("No file selected for preview.");
        return;
    }

    try {
        console.log(`Fetching file link for: ${file_ID}`); // Debugging Step

        const response = await fetch(`http://localhost:13889/paperless/getFileLinkfromDrive/${file_ID}`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("File Response Data:", data); // Debugging Step

        if (data.fileUrl) {
            console.log("Opening file:", data.fileUrl);
            window.open(data.fileUrl, '_blank'); // Opens file in a new tab
        } else {
            alert("File not found on Google Drive.");
        }
    } catch (error) {
        console.error("Error opening preview:", error);
        alert(`Error fetching file link: ${error.message}`);
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

  const toggleUserDropdown = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/homepage");
  };
  
  const handleChangePassword = () => {
    // Add your change password logic here
    navigate("/changepassword"); // Adjust this to your actual route
  };

  return (
    <div className="activity-container">
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
          
          
          <div className="user-dropdown-container">
            <p className="UserLink" onClick={toggleUserDropdown}>
              <a>Welcome, {username}! <span className="dropdown-arrow">▼</span></a>
            </p>
            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <button className="dropdown-item" onClick={handleChangePassword}>
                  Change Password
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
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

                <button className="btn preview" onClick={() => handlePreview(activity.file_ID)}>Preview</button>
                <button className="btn download" onClick={() => handleDownload(activity.file_ID)}>Download <span className="all-column">(All Column)</span></button>
                <button className="btn delete" onClick={() => handleDelete(activity.file_ID)}>Delete</button>
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