import React from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { HelmetMeta } from "./HelmetMeta";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { CssBaseline } from "@material-ui/core";
import { logCredits } from "../utils/logCredits";
import {Resume} from "../pages/Resume";
import {PageNotFound} from "../pages/PageNotFound";
import {Videos} from "../pages/Videos";
import { Home } from "../pages/Home";
import {Upload} from "../pages/Upload";
export const App = () => {
    logCredits();

    return (
        <ThemeProvider>
            <CssBaseline />
            <Router>
                <HelmetMeta />
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/video" component={Videos} />
                    <Route path="/resume" component={Resume} />
                    <Route path="/upload" component={Upload}/>
                    {/*<Route path="*" component={PageNotFound} />*/}
                </Switch>
            </Router>
        </ThemeProvider>
    );
};
