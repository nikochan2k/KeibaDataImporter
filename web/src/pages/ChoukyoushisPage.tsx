import { Link } from "react-router";
import { type ChoukyoushiSummary, useApi } from "../api";
import { Async } from "../components";
import { useIncrementalSearch } from "../useIncrementalSearch";

export function ChoukyoushisPage() {
  const { q, inputProps } = useIncrementalSearch();
  const result = useApi<ChoukyoushiSummary[]>(q ? `/api/choukyoushis?q=${encodeURIComponent(q)}` : null);

  return (
    <div className="fill">
      <h1>調教師</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="調教師名の先頭(姓名・略称・フリガナ)"
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
                    <th>調教師名</th>
                    <th>性</th>
                    <th>所属</th>
                    <th className="num">生年</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((choukyoushi) => (
                    <tr key={choukyoushi.id}>
                      <td>
                        <Link to={`/choukyoushis/${choukyoushi.id}`}>{choukyoushi.meishou}</Link>
                      </td>
                      <td>{choukyoushi.seibetsu}</td>
                      <td>{choukyoushi.shozoku}</td>
                      <td className="num">{choukyoushi.seinen}</td>
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
