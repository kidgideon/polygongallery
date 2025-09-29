import styles from "./page.module.css"
import Payments from "../../../components/payments/payments"
import Verify from "../../../components/verify/verify"
export default function Dashboard() {
    return(
        <div className={styles.dashboardInterface}>
  <Payments/>
  <Verify/>
        </div>
    )
}
