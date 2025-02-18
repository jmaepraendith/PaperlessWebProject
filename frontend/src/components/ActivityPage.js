import React, { useState, useEffect } from "react";
import "../styles/ActivityPage.css";
import axios from "axios";

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get("http://localhost:5000/paperless/activities");
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="activity-container">
      <header>
        <img src="/headerLogo.png" alt="Paperless Flow Logo" className="logo-activity" />
        <nav className="nav-header">
          <p className="HomeLink"><a href="/homepage">Home</a></p>
          <p className="AboutUsLink"><a href="/about-us">About us</a></p>
          <p className="AllToolsLink"><a href="/all-tools">All Tools</a></p>
          <p className="UserLink"><a href="/user">Username</a></p>
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
                <span className="file-name">{activity.name}</span>
                <button className="btn preview">Preview</button>
                <button className="btn download">Download</button>
              </div>
            </section>
          ))
        ) : (
          <p>No activities found.</p>
        )}
      </main>
    </div>
  );
};

export default ActivityPage;