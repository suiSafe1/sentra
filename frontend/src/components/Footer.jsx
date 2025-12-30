// import x from "../assets/x.png";
// import telegram from "../assets/telegram.png";
// import mic from "../assets/mic.png";
import white_logo from "../assets/white_logo.png"

const Footer = () => {
  return (
    <footer className='bg-[#00076C]'>
      <div className='mx-auto p-4 py-6 lg:py-8 w-full max-w-screen-xl'>
        <div className='md:flex md:justify-between'>
          <div className='mb-6 md:mb-0'>
            <a href='#' className='flex items-center'>
              <img src={white_logo} alt="Logo" className="w- h-12" />
            </a>
            {/* <p className='mt-4 text-[#ffffff] text-sm'>
              Secure DeFi savings vault on the <br /> Sui blockchain. Lock,
              earn, and <br />
              grow your crypto assets safely.
            </p>
            <div className='flex justify-start gap-4 mt-4'>
              <img src={x} alt="X link" /><img src={mic} alt="mic" /><img src={telegram} alt="" />
            </div>*/}
          </div>
          {/* <div className='gap-8 sm:gap-6 grid grid-cols-2 sm:grid-cols-4'>
            <div>
              <h2 className='mb-6 font-semibold text-[#ffffff] text-sm uppercase'>
                Product
              </h2>
              <ul className='space-y-2 font-medium text-[#ffffff]/70'>
                <li>
                  <p className='hover:underline cursor-pointer'>Features</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Security</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Roadmap</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>
                    Documentation
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <h2 className='mb-6 font-semibold text-[#ffffff] text-sm uppercase'>
                Company
              </h2>
              <ul className='space-y-2 font-medium text-[#ffffff]/70'>
                <li>
                  <p className='hover:underline cursor-pointer'>About</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Blog</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Careers</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Press Kit</p>
                </li>
              </ul>
            </div>
            <div>
              <h2 className='mb-6 font-semibold text-[#ffffff] text-sm uppercase'>
                Resources
              </h2>
              <ul className='space-y-2 font-medium text-[#ffffff]/70'>
                <li>
                  <p className='hover:underline cursor-pointer'>Help Center</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Community</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Developers</p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Status</p>
                </li>
              </ul>
            </div>
            <div>
              <h2 className='mb-6 font-semibold text-[#ffffff] text-sm uppercase'>
                Legal
              </h2>
              <ul className='space-y-2 font-medium text-[#ffffff]/70'>
                <li>
                  <p className='hover:underline cursor-pointer'>
                    Privacy Policy
                  </p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>
                    Terms of Service
                  </p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>
                    Cookie Policy
                  </p>
                </li>
                <li>
                  <p className='hover:underline cursor-pointer'>Disclaimer</p>
                </li>
              </ul>
            </div>
          </div>  */}
        </div>
        <hr className='sm:mx-auto my-6 lg:my-8 border-[#ffffff]/20 dark:border-gray-700' />
        <div className='sm:flex sm:justify-between sm:items-center'>
          <span className='text-[#ffffff]/70 text-sm sm:text-center'>
            © 2025{" "}
            <a href='#' className='hover:underline'>
              sentra
            </a>
            . All Rights Reserved.
          </span>
          <p className='mt-2 sm:mt-0 text-[#ffffff]/70 text-sm sm:text-center'>
            Built on Sui Network
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
