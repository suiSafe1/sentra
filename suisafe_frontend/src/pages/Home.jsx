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
import lock from "../assets/lock.png";
import nft from "../assets/nft.png";
import yield_token from "../assets/yield.png";
import smart_vesting from "../assets/smart_vesting.png";
import deposit from "../assets/deposit.png";
import earn_withdraw from "../assets/earn_withdraw.png";
import lock_secure from "../assets/lock_secure.png";
import StepsCarousel from "../components/StepCarousel";


const Home = () => {
  const steps = [
    {
      title: "Connect & Deposit",
      description:
        "Connect your wallet and deposit or transfer to secure vaults.",
      icon: deposit,
    },
    {
      title: "Lock & Secure",
      description:
        "Choose lock period and our smart contracts secure your assets.",
      icon: lock_secure,
    },
    {
      title: "Earn & Withdraw",
      description: "Earn and withdraw yield generated from market trends.",
      icon: earn_withdraw,
    },
  ];

  return (
    <div className='flex flex-col justify-center bg-white font-sans text-gray-800'>
      <section className='flex justify-center bg-gradient-to-br from-white via-white to-[#2b3075]'>
        <div className='justify-center content-center self-center my-28 p-4 w-fit text-left align-center'>
          <h1 className='font-bold text-black text-2xl md:text-3xl lg:text-4xl text-center'>
            Secure Your Future with <br />
            <span className='mb-4 font-bold text-blue-900 text-2xl md:text-3xl lg:text-4xl hero-title-highlight'>
              Sentra Vaults
            </span>
          </h1>
          <p className='mb-6 text-gray-600 text-base md:text-lg text-center hero-description'>
            Lock your tokens and NFTs in our battle-tested vaults. Earn yield{" "}
            <br />
            while maintaining complete control and security on the Sui
            Blockchain.
          </p>
          <div className='flex md:flex-row flex-col justify-center items-center gap-4 mb-10 hero-buttons'>
            <Link
              to='/public_dashboard'
              className='bg-blue-900 px-6 py-2 rounded text-white connect-button'
            >
              Launch App
            </Link>
            <button className='bg-white hover:bg-gray-100 px-6 py-2 border border-blue-900 rounded text-blue-900 learn-more-button'>
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section
        id='how-it-works'
        className='mx-auto px-4 py-10 max-w-6xl text-center how-it-works-section'
      >
        <h2 className='mb-4 font-bold text-blue-900 text-xl md:text-2xl section-title'>
          How sentra Works
        </h2>
        <p className='mb-6 md:mb-10 text-gray-600 section-description'>
          Three simple steps to start earning with our decentralized saving
          vault.
        </p>
        <StepsCarousel steps={steps} />
      </section>

      <section
        id='features'
        className='mx-auto mb-12 px-4 py-2 max-w-6xl text-center'
      >
        <h2 className='mb-4 font-bold text-blue-900 text-xl md:text-2xl section-title'>
          Powerful Features
        </h2>
        <p className='mb-6 md:mb-10 text-gray-600 section-description'>
          Everything you need to maximize DeFi returns while maintaining
          security.
        </p>
        <div className='flex flex-wrap justify-center gap-8'>
          {[
            {
              title: "Token Locking",
              icon: lock,
              items: [
                "Lock favorite tokens for predetermined periods and earn competitive yields.",
                "Flexible lock periods.",
                "Competitive APY.",
                "Auto compounding.",
              ],
            },
            {
              title: "NFT Locking",
              icon: nft,
              items: [
                "Safely store valuable NFTs while earning passive income.",
                "NFT collateral",
                "Fractionalized yields.",
                "Secure storage.",
              ],
            },
            {
              title: "Yield Generation",
              icon: yield_token,
              items: [
                "Multiple yield strategies to maximize your returns across different risk profiles.",
                "DeFi strategies.",
                "Risk management",
                "Transparent returns.",
              ],
            },
            {
              title: "Smart Vesting",
              icon: smart_vesting,
              items: [
                "Automated vesting schedules with customizable unlock periods.",
                "Custom schedules.",
                "Partial unlocks",
                "Emergency exits.",
              ],
            },
          ].map((feature, index) => (
            <div
              key={index}
              className='flex gap-4 bg-white shadow p-6 rounded-lg min-w-90 max-w-120'
            >
              <img src={feature.icon} alt='' className='w-12 h-12' />
              <div>
                <div className='mb-3 font-semibold text-xl text-left'>
                  {feature.title}
                </div>
                <ul className='space-y-2'>
                  {feature.items.map((item, i) => (
                    <li key={i} className='flex items-center gap-2 text-left'>
                      {i === 0 ? (
                        <div>{item}</div>
                      ) : (
                        <>
                          <img src={mark} alt='mark' className='w-3 h-3' />
                          <div>{item}</div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
