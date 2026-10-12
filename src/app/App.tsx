import Provider from "./Provider";
import Routers from "./router";

export default function App() {
  return (
    <>
      <Provider> 
        <Routers />
      </Provider>
    </>
  );
}
