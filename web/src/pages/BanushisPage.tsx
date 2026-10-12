import { Link } from "react-router";
import { type BanushiSummary, useApi } from "../api";
import { Async } from "../components";
import { useIncrementalSearch } from "../useIncrementalSearch";

export function BanushisPage() {
  const { q, inputProps } = useIncrementalSearch();
  const result = useApi<BanushiSummary[]>(q ? `/api/banushis?q=${encodeURIComponent(q)}` : null);

  return (
    <div className="fill">
      <h1>馬主</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="馬主名の先頭(正式名・略称・フリガナ)"
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
                    <th>馬主名</th>
                    <th>服色</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((banushi) => (
                    <tr key={banushi.id}>
                      <td>
                        <Link to={`/banushis/${banushi.id}`}>{banushi.meishou}</Link>
                      </td>
                      <td>{banushi.fukushoku}</td>
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
