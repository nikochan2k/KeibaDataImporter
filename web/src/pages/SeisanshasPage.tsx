import { Link } from "react-router";
import { type SeisanshaSummary, useApi } from "../api";
import { Async } from "../components";
import { useIncrementalSearch } from "../useIncrementalSearch";

export function SeisanshasPage() {
  const { q, inputProps } = useIncrementalSearch();
  const result = useApi<SeisanshaSummary[]>(q ? `/api/seisanshas?q=${encodeURIComponent(q)}` : null);

  return (
    <div className="fill">
      <h1>生産者</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="生産者名の先頭(正式名・略称・フリガナ)"
          {...inputProps}
        />{" "}
        <span className="muted">前方一致(入力した文字で始まる名前)</span>
      </form>
      {q && (
        <Async state={result}>
          {(list) =>
            list.length === 0 ? (
              <p className="muted">見つかりませんでした</p>
            ) : (
              <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>生産者名</th>
                    <th>所在地</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((seisansha) => (
                    <tr key={seisansha.id}>
                      <td>
                        <Link to={`/seisanshas/${seisansha.id}`}>{seisansha.meishou}</Link>
                      </td>
                      <td>{seisansha.juusho}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )
          }
        </Async>
      )}
    </div>
  );
}
