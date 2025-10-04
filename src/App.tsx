import SkillTree from './Components/SkillTree/SkillTree';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <div className={styles.border}>
        <div className={styles.shadow}>
          <div className={styles.title}>Minecraft</div>
          <div className={styles.container}>
            <SkillTree />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
