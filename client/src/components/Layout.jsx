// DESCRIPTION: purpose of this is s later more dynamic sya esp if there is a user log in

// import Header from './Header';
// import Footer from './Footer';

function Layout({children}) {
    return (
        // vertical layout
        <div className="flex flex-col min-h-screen text-white bg-pink-100"> 
            {/* <Header/> */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto">{children}</main>
            {/* <Footer/> */}
        </div>
    );

}

export default Layout;