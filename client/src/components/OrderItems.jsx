import { formatPrice } from '../utils/money'

// The lines of an order: what was bought, how it was set up, and the price paid
function OrderItems({ items }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-4 border-t border-border py-3 first:border-t-0">
          <img src={item.src} alt="" className="h-16 w-20 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className="m-0 font-heading text-[1.05rem]">{item.title}</p>
            <p className="m-0 text-[.85rem] text-muted">
              {item.sizeLabel} · {item.frameName} · {item.finishName}
            </p>
          </div>
          <p className="m-0 shrink-0 text-right text-[.9rem]">
            {item.quantity} × {formatPrice(item.unitPriceCents)}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default OrderItems
