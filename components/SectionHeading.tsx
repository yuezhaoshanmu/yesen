export default function SectionHeading({index,eyebrow,title,description,className=''}:{index:string;eyebrow:string;title:React.ReactNode;description?:string;className?:string}){
 return <div className={`section-heading ${className}`} data-reveal><div className="section-kicker"><span className="section-index">{index}</span><span className="eyebrow">{eyebrow}</span></div><h2>{title}</h2>{description&&<p>{description}</p>}</div>;
}
