import "./App.css";
import Screen from "./Screen/Screen.jsx";

export default function App() {
  return (
    <>
      <section>
        <h1>Boids</h1>
        <p>
          Boids is an artificial life simulation originally developed by Craig
          Reynolds. The aim of the simulation was to replicate the behavior of
          flocks of birds. Instead of controlling the interactions of an entire
          flock, however, the Boids simulation only specifies the behavior of
          each individual bird. With only a few simple rules, the program
          manages to generate a result that is complex and realistic enough to
          be used as a framework for computer graphics applications such as
          computer generated behavioral animation in motion picture films.
        </p>
      </section>

      <main>
        <article>
          <strong>
            There are only 3 rules which specify the behavior of each bird:{" "}
          </strong>
          <ol>
            <li>
              <p>
                <strong>Separation: </strong>
                Each bird attempts to maintain a reasonable amount of distance
                between itself and any nearby birds, to prevent overcrowding.
              </p>
            </li>
            <li>
              <p>
                <strong>Alignment: </strong>
                Birds try to change their position so that it corresponds with
                the average alignment of other nearby birds.
              </p>
            </li>
            <li>
              <p>
                <strong>Cohesion: </strong>
                Every bird attempts to move towards the average position of
                other nearby birds.
              </p>
            </li>
          </ol>
        </article>

        <Screen />
      </main>

      <section>
        <h2>Emergent Behaviour</h2>
        <p>
          As in the Game of Life, the simple rules of the Boids simulation
          sometimes gives rise to surprisingly complex behavior. Although the
          long-term behavior of an entire flock is difficult (if not impossible)
          to predict, its motion and arrangement is predictable and orderly over
          small periods of time.
        </p>
      </section>
      <section>
        <h2>Swarm Intelligence</h2>
        <p>
          Boids is only one of many experiments in what is known as the field of
          &quotswarm intelligence&quot. A key aspect of swarm intelligence
          systems is the lack of a centralized control agent--instead each
          individual unit in the swarm follows its own defined rules, sometimes
          resulting in surprising overall behavior for the group as a whole.
        </p>
      </section>
    </>
  );
}
