import { useState } from "react";
import styles from "../styles/sizeGuide.module.scss";
import Link from "next/link";

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState("rings");

  return (
    <div className={styles.sizeGuideContainer}>
      <h1>Jewelry Size Guide</h1>
      <p>
        Finding the perfect fit for your Silver Lining jewelry is essential for
        both comfort and style.
      </p>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "rings" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("rings")}
        >
          Ring Sizing
        </button>
        {/* Additional tabs can be added here for other jewelry types */}
      </div>

      {activeTab === "rings" && (
        <div className={styles.tabContent}>
          <div className={styles.infoSection}>
            <h2>How to Measure Your Ring Size</h2>
            <p>
              We use standard US sizing for all our rings. If you already know
              your US size, you can order with confidence.
            </p>
            <p>
              If you know your Indian ring size, please refer to our conversion
              chart below to find your US equivalent.
            </p>
          </div>

          <div className={styles.methodsSection}>
            <div className={styles.method}>
              <h3>Method 1: Measure an Existing Ring</h3>
              <p>
                Find a ring that fits perfectly on the desired finger. Measure
                its inner diameter with a ruler and use our chart to determine
                your size.
              </p>
              <div className={styles.ringDiagram}>
                <div className={styles.diagramOuter}>
                  <div className={styles.diagramInner}></div>
                  <div className={styles.ruler}>
                    <div className={styles.rulerLine}></div>
                    <div className={styles.measurement}>18mm</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.method}>
              <h3>Method 2: String Measurement</h3>
              <p>
                Wrap a piece of string or strip of paper around the base of your
                finger. Mark where the string meets and measure the length with
                a ruler. This gives you the circumference, which you can match
                to our size chart.
              </p>
              <p className={styles.tip}>
                Tip: For the most accurate measurement, measure your finger at
                the end of the day when your fingers are at their largest.
              </p>
            </div>
          </div>

          <div className={styles.sizeChartSection}>
            <h2>Ring Size Conversion Chart</h2>
            <div className={styles.tableContainer}>
              <table className={styles.sizeTable}>
                <thead>
                  <tr>
                    <th>Circumference (mm)</th>
                    <th>Diameter (mm)</th>
                    <th>US Ring Size</th>
                    <th>Indian Ring Size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>44.25</td>
                    <td>14.07</td>
                    <td>3</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>44.75</td>
                    <td>14.27</td>
                    <td>3.25</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>45.5</td>
                    <td>14.5</td>
                    <td>3.5</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td>47</td>
                    <td>14.88</td>
                    <td>4</td>
                    <td>7</td>
                  </tr>
                  <tr>
                    <td>48</td>
                    <td>15.29</td>
                    <td>4.5</td>
                    <td>8</td>
                  </tr>
                  <tr>
                    <td>49</td>
                    <td>15.70</td>
                    <td>5</td>
                    <td>9</td>
                  </tr>
                  <tr>
                    <td>50.5</td>
                    <td>16.10</td>
                    <td>5.5</td>
                    <td>10</td>
                  </tr>
                  <tr>
                    <td>51.75</td>
                    <td>16.51</td>
                    <td>6</td>
                    <td>11</td>
                  </tr>
                  <tr>
                    <td>52.5</td>
                    <td>16.71</td>
                    <td>6.25</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>53</td>
                    <td>16.92</td>
                    <td>6.5</td>
                    <td>13</td>
                  </tr>
                  <tr>
                    <td>54</td>
                    <td>17.32</td>
                    <td>7</td>
                    <td>14</td>
                  </tr>
                  <tr>
                    <td>55.6</td>
                    <td>17.73</td>
                    <td>7.5</td>
                    <td>15</td>
                  </tr>
                  <tr>
                    <td>57</td>
                    <td>18.14</td>
                    <td>8</td>
                    <td>16</td>
                  </tr>
                  <tr>
                    <td>58.25</td>
                    <td>18.54</td>
                    <td>8.5</td>
                    <td>17</td>
                  </tr>
                  <tr>
                    <td>59.5</td>
                    <td>18.95</td>
                    <td>9</td>
                    <td>18</td>
                  </tr>
                  <tr>
                    <td>60.75</td>
                    <td>19.35</td>
                    <td>9.5</td>
                    <td>19</td>
                  </tr>
                  <tr>
                    <td>62</td>
                    <td>19.76</td>
                    <td>10</td>
                    <td>20</td>
                  </tr>
                  <tr>
                    <td>62.75</td>
                    <td>19.96</td>
                    <td>10.25</td>
                    <td>21</td>
                  </tr>
                  <tr>
                    <td>63</td>
                    <td>20.17</td>
                    <td>10.5</td>
                    <td>22</td>
                  </tr>
                  <tr>
                    <td>64.7</td>
                    <td>20.57</td>
                    <td>11</td>
                    <td>23</td>
                  </tr>
                  <tr>
                    <td>66</td>
                    <td>20.98</td>
                    <td>11.5</td>
                    <td>24</td>
                  </tr>
                  <tr>
                    <td>67</td>
                    <td>21.39</td>
                    <td>12</td>
                    <td>25</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.helpSection}>
            <h3>Still Need Help?</h3>
            <p>
              Our jewelry experts are ready to assist you with finding your
              perfect fit.
            </p>
            <Link href="/contact" className={styles.contactBtn}>
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
