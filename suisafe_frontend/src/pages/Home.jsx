import { Link } from "react-router-dom";
import {
  FaWallet,
  FaChartLine,
  FaLock,
  FaUsers,
  FaShieldAlt,
  FaKey,
  FaCoins,
  FaQuoteLeft,
} from "react-icons/fa";
import mark from "../assets/Mark.png";
import "../styles/landing.css";


const Home = () => {
  const steps = [
    {
      title: "Connect & Deposit",
      description: "Connect your wallet and deposit or transfer to secure vaults.",
      icon: <FaWallet className='step-icon' />,
    },
    {
      title: "Lock & Secure",
      description: "Choose lock period and our smart contracts secure your assets.",
      icon: <FaLock className='step-icon' />,
    },
    {
      title: "Earn & Withdraw",
      description: "Earn and withdraw yield generated from market trends.",
      icon: <FaCoins className='step-icon' />,
    },
  ];


  return (
    <div className='sui-safe-landing'>
      <section className='hero-section'>
        <section className='hero-content'>
          <h1 className='hero-title'>Secure Your Future with</h1>
          <h1 className='hero-title-highlight'>SuiSafe Vaults</h1>
          <p className='hero-description'>
            Lock your tokens and NFTs in our battle-tested vaults. Earn yield <br />
            while maintaining complete control and security on the Sui Blockchain.
          </p>
          <div className='hero-buttons'>
            <Link to='/connect' className='connect-button'>
              Connect Wallet
            </Link>
            <button className='learn-more-button'>
              Learn More
            </button>
          </div>
          <div className='stats-grid'>
            <div>
              <p className='stat-value'>
                <FaChartLine className='icon' /> $50M+
              </p>
              <p className='stat-label'>Total Value Locked</p>
            </div>
            <div>
              <p className='stat-value'>
                <FaCoins className='icon' /> 15%+
              </p>
              <p className='stat-label'>Average APY</p>
            </div>
            <div>
              <p className='stat-value'>
                <FaUsers className='icon' /> 10K+
              </p>
              <p className='stat-label'>Active Users</p>
            </div>
          </div>
        </section>
      </section>

      <section id='how-it-works' className='how-it-works-section'>
        <h2 className='section-title'>How SuiSafe Works</h2>
        <p className='section-description'>
          Three simple steps to start earning with our decentralized saving vault.
        </p>
        <div className='steps-grid'>
          {steps.map(({ title, description, icon }, index) => (
            <div key={index} className='step'>
              <div className='step-icon-container'>
                {icon}
                <div className='step-number'>{index + 1}</div>
              </div>
              <p className='step-title'>{title}</p>
              <p className='step-description'>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='features' className='features-section'>
        <h2 className='section-title'>Powerful Features</h2>
        <p className='section-description'>
          Everything you need to maximize DeFi returns while maintaining security.
        </p>
        <div className='features-grid'>
          {[
            {
              title: "Token Locking",
              icon: <FaLock className='icon feature-icon-lock' />,
              items: [
                "Lock favorite tokens for predetermined periods and earn.",
                "Flexible lock periods.",
                "Competitive APY.",
                "Auto compounding.",
              ],
            },
            {
              title: "NFT Locking",
              icon: <FaKey className='icon feature-icon-lock' />,
              items: [
                "Safely store valuable NFTs while earning passive income.",
                "NFT collateral",
                "Fractionalized yields.",
                "Secure storage.",
              ],
            },
            {
              title: "Yield Generation",
              icon: <FaCoins className='icon feature-icon-lock' />,
              items: [
                "Multiple yield strategies to maximize your returns across different risk profiles.",
                "DeFi strategies.",
                "Risk management",
                "Transparent returns.",
              ],
            },
            {
              title: "Smart Vesting",
              icon: <FaShieldAlt className='icons feature-icon-locks' />,
              items: [
                "Automated vesting schedules with customizable unlock periods.",
                "Custom schedules.",
                "Partial unlocks",
                "Emergency exits.",
              ],
            },
          ].map((feature, index) => (
            <div key={index} className='feature-card'>
              <div className='feature-icon'>{feature.icon}</div>
              <div>
                <div className='feature-title'>{feature.title}</div>
                <ul className='feature-list'>
                  {feature.items.map((item, i) => (
                    <li className='feature-item' key={i}>
                      <img src={mark} alt='mark' />
                      <div>{item}</div>
                    </li>
                  ))}

                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id='security' className='security-section'>
        <h2 className='section-title'>Security First</h2>
        <p className='section-description'>
          Your trust is our foundation. We've implemented industry-leading security measures to protect your assets.
        </p>
        <div className='security-grid'>
          <div className='security-features'>
            <ul className='security-list'>
              {[
                "Multi-signature smart contracts.",
                "Auded by leading security firms.",
                "Insurance coverage up to $10M.",
                "Real-time monitoring & alerts",
                "Emergency pause functionality.",
                "Decentralized governance.",
              ].map((item, i) => (
                <li className='security-item' key={i}>
                  <FaShieldAlt className='icon' />
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className='security-info'>
            {/* <div className='security-icon'></div> */}
            <div className='security-details'>
              <h3 className='security-title'>
                <FaShieldAlt className='icon' /> Battle-Tested Security
              </h3>
              <p className='security-description'>
                Our smart contracts have been audited by CertiK, OpenZeppelin, and ConsenSys Diligence. We maintain the highest security standards in the DeFi space.
              </p>
              <ul className='security-stats'>
                {[
                  ["99.9%", "Uptime"],
                  ["0", "Exploits"],
                  ["24/7", "Monitoring"],
                ].map(([value, label], i) => (
                  <li key={i} className='security-stat'>
                    <p className='stat-value'>{value}</p>
                    <p className='stat-label'>{label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id='testimonials' className='testimonials-section'>
        <h2 className='section-title'>Trusted by Thousands</h2>
        <p className='section-description'>
          See what our community says about SuiSafe.
        </p>
        <div className='testimonials-grid'>
          {[
            {
              quote:
                "SuiSafe has been rock solid for my portfolio. The yields are consistent and I sleep well knowing my assets are secure.",
              name: "Desmond",
              role: "DeFi Investor",
            },
            {
              quote:
                "Finally, a platform that prioritizes security without sacrificing returns. The NFT locking feature is game-changing.",
              name: "Eke",
              role: "Portfolio Manager",
            },
            {
              quote:
                "We've moved 30% of our DeFi allocation to SuiSafe. The transparency and security measures are exactly what we needed.",
              name: "Polaris",
              role: "Crypto Enthusiast",
            },
          ].map((testimonial, index) => (
            <div key={index} className='testimonial-card'>
              <p className='testimonial-quote'>
                <FaQuoteLeft className='icon quote-icon' /> "{testimonial.quote}"
              </p>
              <div className='testimonial-author'>
                <div className='author-avatar'></div>
                <div>
                  <p className='author-name'>{testimonial.name}</p>
                  <p className='author-role'>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
