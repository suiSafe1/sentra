import React, { useState } from "react";
import "../styles/Createlock.css";
import { FaCheck } from "react-icons/fa";

function CreateLockNft() {
  const [selectDate, setSelectDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  return (
    <div className="lock-nft-subform">
      <form>
        {/*  Select NFT */}
        <section className="nft-cards">
          <div className="card selected">
            <div className="card-header">
              <h2 className="nft-card-h active">SUI Punk #123</h2>
              <span className="checkmark">
                <FaCheck className="icons-small" />
              </span>
            </div>
            <p className="active">SUI Punks</p>
            <span className="badge">Rare</span>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="nft-card-h">SUI Punk #123</h2>
            </div>
            <p>SUI Punks</p>
            <span className="badge">Rare</span>
          </div>
          <div className="card">
            <div className="card-header">
              <h2 className="nft-card-h">SUI Punk #123</h2>
            </div>
            <p>SUI Punks</p>
            <span className="badge">Rare</span>
          </div>
          <div className="card">
            <div className="card-header">
              <h2 className="nft-card-h">SUI Punk #123</h2>
            </div>
            <p>SUI Punks</p>
            <span className="badge">Rare</span>
          </div>
        </section>

        {/*  Lock Duration */}
        <label className="form-label">Lock Duration</label>
        <div className="duration-buttons">
          <button type="button" className="duration active">
            30 Days
          </button>
          <button type="button" className="duration">
            60 Days
          </button>
          <button type="button" className="duration">
            90 Days
          </button>
          <button type="button" className="duration">
            120 Days
          </button>
        </div>
        {/*  Custom Date */}
        <label className="form-label">
          <button type="button" onClick={() => setSelectDate(!selectDate)}>
            {selectedDate ? selectedDate : "Pick a custom date"}
          </button>

          {selectDate && (
            <input
              onChange={handleDateChange}
              type="date"
              className="select-date"
            />
          )}
        </label>
        {/* yield  */}
        <div className="yield-card">
          <div className="yield-card-text">
            <h3>Estimated Yield (Annual)</h3>
            <p>Based on current market conditions and lock duration</p>
          </div>
          <div className="yield-card-value">+98.76 SUI</div>
        </div>

        {/*  Memo */}
        <label className="form-label">
          Memo(Optional)
          <textarea
            className="memo"
            placeholder="Reason for lock (e.g., Long-term holding, Yield farming...)"></textarea>
        </label>

        {/*  Action Buttons */}
        <div className="action-buttons">
          <button className="confirm">Confirm Lock</button>
          <button className="cancel">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default CreateLockNft;
