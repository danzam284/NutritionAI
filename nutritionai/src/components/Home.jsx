import "../App.css";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Badge, notification } from 'antd';
import { NotificationTwoTone } from '@ant-design/icons';

function Home() {
  const { isSignedIn, user } = useUser();
  const [ newNotifications, setNewNotifications ] = useState(false);
  const [ newNot, setNewNot ] = useState(null);
  const [ oldNot, setOldNot ] = useState(null);
  const [ open, setOpen ] = useState(false);
  const [ lookingNew, setLookingNew ] = useState(true);

  //Sends a request to register the user if they have not been already
  useEffect(() => {

    async function getUserAndNotifications() {
      await axios.post("http://localhost:3000/newUser", {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username,
        profilePicture: user.imageUrl,
      });

      const { data } = await axios.get(`http://localhost:3000/user/${user.id}`);
      const newNotifs = data.notifications.filter((notification) => !notification.seen);
      const oldNotifs = data.notifications.filter((notification) => notification.seen);

      setNewNot(newNotifs);
      setOldNot(oldNotifs);
      setNewNotifications(newNotifs.length !== 0);
    }

    if (isSignedIn) {
      getUserAndNotifications();
    }
  }, [isSignedIn]);

  return (
    <div className="responsive-container">
      <Modal 
        title={lookingNew ? "New Notifications" : "Old Notifications"} 
        open={open} 
        cancelButtonProps={{ style: {display: "none"}}}
        onOk={() => {
          setOldNot((prevOldNot) => [...prevOldNot, ...newNot]);
          setNewNot([]);
          setOpen(false);
          setLookingNew(true)
        }}
        onCancel={() => {
          setOldNot((prevOldNot) => [...prevOldNot, ...newNot]);
          setNewNot([]);
          setOpen(false);
          setLookingNew(true)
        }}
      >
        {lookingNew ? 
          <div>
            {newNot && newNot.length ? 
              newNot.map((notification) => (
                <div key={notification.message} style={{backgroundColor: "gray", padding: "10px"}}>
                  {notification.message}
                </div>
              )) :
              <p>You have no new Notifications</p>
            }
            <br></br>
            <button className="responsive-button" onClick={() => setLookingNew(false)}>View Old Notifications</button>
          </div>
          :
          <div>
            {oldNot.map((notification) => (
              <div key={notification.message} style={{backgroundColor: "gray", padding: "10px"}}>
                {notification.message}
              </div>
            ))}
            <br></br>
            <button className="responsive-button" onClick={() => setLookingNew(true)}>View New Notifications</button>
          </div>
        }
      </Modal>

      <Badge dot style={newNotifications ? {width: "10px", height: "10px"} : {display: "none"}}>
        <NotificationTwoTone
          onClick={async () => {
            setOpen(true);
            setNewNotifications(false);
            await axios.post("http://localhost:3000/seenNotifications", {userId: user.id});
          }}
          style={{fontSize: "30px", cursor: "pointer"}}
          twoToneColor={"black"}
          className="responsive-icon"
        />
      </Badge>

      <h1 className="responsive-heading">NutritionAI Homepage</h1>
      <div id="nav" className="responsive-nav">
        <Link to="/upload" className="responsive-link">Upload</Link>
        <Link to="/profile" className="responsive-link">Profile</Link>
        <Link to="/add-friends" className="responsive-link">Add Friends</Link>
        <Link to="/friends-meals" className="responsive-link">View Friends Meals</Link>
        <Link to="/tracking" className="responsive-link">Goal Tracking</Link>
      </div>
    </div>
  );
}

export default Home;
