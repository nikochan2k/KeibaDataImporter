import { Link } from "react-router";
import { type KishuSummary, useApi } from "../api";
import { Async } from "../components";
import { useIncrementalSearch } from "../useIncrementalSearch";

export function KishusPage() {
  const { q, inputProps } = useIncrementalSearch();
  const result = useApi<KishuSummary[]>(q ? `/api/kishus?q=${encodeURIComponent(q)}` : null);

  return (
    <div className="fill">
      <h1>騎手</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="騎手名の先頭(姓名・略称・フリガナ)"
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
                    <th>騎手名</th>
                    <th>性</th>
                    <th>所属</th>
                    <th className="num">生年</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((kishu) => (
                    <tr key={kishu.id}>
                      <td>
                        <Link to={`/kishus/${kishu.id}`}>{kishu.meishou}</Link>
                      </td>
                      <td>{kishu.seibetsu}</td>
                      <td>{kishu.shozoku}</td>
                      <td className="num">{kishu.seinen}</td>
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
