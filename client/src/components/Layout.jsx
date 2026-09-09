// DESCRIPTION: Layout wrapper supporting future dynamic sections like Header/Footer

function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen text-white bg-pink-100"> 
            {/* <Header/> */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 overflow-y-auto">
                {children}
            </main>
            {/* <Footer/> */}
        </div>
    );
}

export default Layout;