import { ISvg } from '../domain/svg-provider';
import { ISettings } from '../domain/settings-provider';
import { ICircle } from '../domain/circle-provider';
import { useEffect, useState } from 'react';
import { circleMovement, convertRange, degreesToRadians, mod, Vector2 } from 'mz-math';
import { getBoolean } from '../domain/common-provider';

interface IInnerCircleProps {
    maskId: string;
    settings: ISettings;
    svg: ISvg;
    circle: ICircle;
    onClick: React.MouseEventHandler
}

const InnerCircle = (props: IInnerCircleProps) => {

    const { svg, maskId, settings, circle, onClick } = props;

    const [ startPoint, setStartPoint ] = useState<Vector2>([0, 0]);
    const [ innerStartPoint, setInnerStartPoint ] = useState<Vector2>([0, 0]);
    const [ outerStartPoint, setOuterStartPoint ] = useState<Vector2>([0, 0]);
    const [ endPoint, setEndPoint ] = useState<Vector2>([0, 0]);
    const [ innerEndPoint, setInnerEndPoint ] = useState<Vector2>([0, 0]);
    const [ outerEndPoint, setOuterEndPoint ] = useState<Vector2>([0, 0]);
    const [innerDistance, setInnerDistance] = useState(0);
    const [outerDistance, setOuterDistance] = useState(0);
    const [ largeArcFlag, setLargeArcFlag ] = useState(0);
    const [ pathInnerBgFull, setPathInnerBgFull] = useState(false);

    useEffect(() => {
        if(mod(svg.startAngleDeg, 360) === mod(svg.endAngleDeg, 360)) {
            setPathInnerBgFull(true);
            return;
        }

        setPathInnerBgFull(getBoolean(settings.pathInnerBgFull, false));
    }, [
        settings.pathInnerBgFull,
        svg.startAngleDeg,
        svg.endAngleDeg,
    ]);

    useEffect(() => {
        const innerDistance_ = (settings.longerTicksHeight ?? settings.ticksHeight ?? 0) + (settings.tickValuesDistance) + settings.tickValuesFontSize * 2
        const outerDistance_ = settings.pointerRadius
        setInnerDistance(innerDistance_)
        setOuterDistance(outerDistance_)

        const startAngleDeg = convertRange(svg.startAngleDeg, 0, Math.PI*2, 0, Math.PI);
        setStartPoint(circleMovement([svg.cx, svg.cy], degreesToRadians(startAngleDeg), svg.radius));
        setInnerStartPoint(circleMovement([svg.cx, svg.cy], degreesToRadians(startAngleDeg - 3), svg.radius - innerDistance_));
        setOuterStartPoint(circleMovement([svg.cx, svg.cy], degreesToRadians(startAngleDeg - 3), svg.radius + outerDistance_));

        const endAngleDeg = convertRange(svg.endAngleDeg, 0, Math.PI*2, 0, Math.PI);
        setEndPoint(circleMovement([svg.cx, svg.cy], degreesToRadians(endAngleDeg), svg.radius));
        setInnerEndPoint(circleMovement([svg.cx, svg.cy], degreesToRadians(endAngleDeg + 3), svg.radius - innerDistance_));
        setOuterEndPoint(circleMovement([svg.cx, svg.cy], degreesToRadians(endAngleDeg + 3), svg.radius + outerDistance_));

        const largeArcFlag = svg.endAngleDeg - svg.startAngleDeg <= 180 ? 1 : 0;
        setLargeArcFlag(largeArcFlag);
    }, [settings.longerTicksHeight, settings.pointerRadius, settings.tickValuesDistance, settings.tickValuesFontSize, settings.ticksHeight, svg.cx, svg.cy, svg.endAngleDeg, svg.radius, svg.startAngleDeg]);

    return (
        <>
            {
              settings.pathInnerBgColor &&!pathInnerBgFull &&
                <mask id={ maskId }>
                    <path
                        fill="black"
                        d={ `M ${ startPoint[0] } ${ startPoint[1] } A ${ svg.radius } ${ svg.radius } 1 ${ largeArcFlag } 0 ${ endPoint[0] } ${ endPoint[1] }` }
                    />
                    <path
                        fill="white"
                        d={ `M ${ startPoint[0] } ${ startPoint[1] } A ${ svg.radius } ${ svg.radius } 0 ${ largeArcFlag === 1 ? 0 : 1 } 1 ${ endPoint[0] } ${ endPoint[1] }` }
                    />
                </mask>
            }
            {
              settings.pathInnerBgColor &&

                <circle
                    strokeDasharray={ circle.strokeDasharray }
                    strokeDashoffset={ circle.strokeOffset }
                    cx={ svg.cx }
                    cy={ svg.cy }
                    r={ svg.radius }
                    stroke={ 'transparent' }
                    strokeWidth={ svg.thickness }
                    fill={ settings.pathInnerBgColor }
                    shapeRendering="geometricPrecision"
                    strokeLinecap="round"
                    data-type="path-inner"
                    className="mz-round-slider-path-inner"
                    mask={ pathInnerBgFull ? '' : `url(#${ maskId })`}
                />
            }
            <path
              onClick={onClick}
              strokeDasharray={ circle.strokeDasharray }
              strokeDashoffset={ circle.strokeOffset }
              d={ `M ${ outerStartPoint[0] } ${ outerStartPoint[1] } A ${ svg.radius  + outerDistance} ${ svg.radius  + outerDistance} 0 ${ largeArcFlag === 1 ? 0 : 1 } 1 ${ outerEndPoint[0] } ${ outerEndPoint[1] }
                            L ${innerEndPoint[0]} ${innerEndPoint[1]} A ${ svg.radius  - innerDistance} ${ svg.radius  - innerDistance} 0 ${ largeArcFlag === 1 ? 0 : 1 } 0 ${ innerStartPoint[0] } ${ innerStartPoint[1] }
                        ` }
              fill={ 'transparent' }
              stroke={ 'transparent' }
              strokeWidth={ svg.thickness }
              shapeRendering="geometricPrecision"
              strokeLinecap="round"
              data-type="path-inner"
              className="mz-round-slider-path-inner-clickable"
              // mask={ pathInnerBgFull ? '' : `url(#${ maskId })`}
              style={{ pointerEvents: "visiblePainted", zIndex: 1, cursor: "pointer" }}
            />
        </>
    )
};

export default InnerCircle;
