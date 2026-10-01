// DESCRIPTION: Layout wrapper supporting future dynamic sections like Header/Footer

function Layout({ children }) {
    return (
        <div className="flex flex-col h-dvh text-gray-900 bg-pink-100">
            <main className="flex-1 flex flex-col items-center p-3 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

export default Layout;