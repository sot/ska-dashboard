import React from 'react';

import { Outlet } from "react-router-dom";


/*
This class is intended to be used at the top of the React-router route.
It is a nice way to provide a top-level layout
*/

class Layout extends React.Component {
    render() {
        return (
          <>
          <Outlet/> {/* this is the magic statement that includes the nested routes */}
          </>
        );
    }
}

export default Layout;

